from mephisto.operations.supervisor import * # Supervisor, Agent, Packet, PACKET_TYPE_INIT_DATA, SYSTEM_CHANNEL_ID
from mephisto.data_model.exceptions import (
    AgentReturnedError,
    AgentDisconnectedError,
    AgentTimeoutError,
    AgentShutdownError,
)
import random
from mephisto.data_model.constants.assignment_state import AssignmentState
from chat_and_annotate_agent_state import DISALLOWED_RECONNECT, DISALLOWED_CONCURRENT, MAX_UNITS, COMPLETED, GOPEN, XSCREEN, CUSTOM_ERRORS
from mephisto.operations.task_launcher import GOLD_UNIT_INDEX

class CustomSupervisor(Supervisor):

    def _get_init_data(self, packet, channel_info):
        """
        Get the initialization data for the assigned agent's task
        Works with OnboardingAgents, unlike original
        """
        task_runner = channel_info.job.task_runner
        agent_id = packet.data["provider_data"]["agent_id"]
        if agent_id in CUSTOM_ERRORS:
            agent_data_packet = Packet(
                packet_type=PACKET_TYPE_INIT_DATA,
                sender_id=SYSTEM_CHANNEL_ID,
                receiver_id=channel_info.channel_id,
                data={"request_id": packet.data["request_id"], "init_data": None},
            )
            self.message_queue.append(agent_data_packet)
        else:
            agent_info = self.agents[agent_id]
            unit_data = task_runner.get_init_data_for_agent(agent_info.agent)

            agent_data_packet = Packet(
                packet_type=PACKET_TYPE_INIT_DATA,
                sender_id=SYSTEM_CHANNEL_ID,
                receiver_id=channel_info.channel_id,
                data={"request_id": packet.data["request_id"], "init_data": unit_data},
            )

            self.message_queue.append(agent_data_packet)

            if isinstance(unit_data, dict) and unit_data.get("raw_messages") is not None:
                # TODO bring these into constants somehow
                for message in unit_data["raw_messages"]:
                    packet = Packet.from_dict(message)
                    packet.receiver_id = agent_id
                    agent_info.agent.pending_observations.append(packet)

    def custom_get_valid_units(self, worker, task_run):

        config = task_run.get_task_config()

        if 'mturk' in task_run.args.provider.get('_provider_type', 'mock'):
            if task_run.args.blueprint.get('worker_blocklist_paths', None) is not None:
                blocklist_paths = task_run.args.blueprint.worker_blocklist_paths.split(',')
                worker_blocklist = set()
                for path in blocklist_paths:
                    with open(path) as f:
                        worker_blocklist |= set(f.read().strip().split('\n'))
                print(f'About to soft-block {len(worker_blocklist):d} workers')
                if worker.worker_name in worker_blocklist:
                    return [], MAX_UNITS # worker blocked

        related_units = task_run.db.find_units(
            task_id=task_run.task_id,
            worker_id=worker.db_id,
        )
        completed_types = AssignmentState.completed()
        worker_currently_completed = [u for u in related_units if u.db_status in completed_types]
        completed_num = len(worker_currently_completed)
        completed_ids = [u.get_assignment_data().shared[0].get("group_id", None) for u in worker_currently_completed if len(u.get_assignment_data().shared) > 0]

        # if config.allowed_concurrent != 0 or config.maximum_units_per_worker:
        current_units = task_run.db.find_units(
            task_run_id=task_run.db_id,
            worker_id=worker.db_id,
            status=AssignmentState.ASSIGNED,
        )
        currently_active = len(current_units)
        if config.allowed_concurrent != 0:
            if currently_active >= config.allowed_concurrent:
                logger.debug(
                    f"{worker} at maximum concurrent units {currently_active}"
                )
                return [], DISALLOWED_CONCURRENT  # currently at the maximum number of concurrent units
        if config.maximum_units_per_worker != 0:
            if (
                currently_active + completed_num
                >= config.maximum_units_per_worker
            ):
                logger.debug(
                    f"{worker} at maximum units with active: {currently_active} and completed: {completed_num}"
                )
                return [], MAX_UNITS  # Currently at the maximum number of units for this task

        # check if gold unit open but not completed yet, and don't allow concurrent assignment if yes
        open_gold_units = [u for u in current_units if u.unit_index == GOLD_UNIT_INDEX]
        open_gold_agents = [a for u in open_gold_units for a in task_run.db.find_agents(unit_id=u.db_id, status=AssignmentState.ACCEPTED)]
        if len(open_gold_agents) > 0:
            return [], GOPEN

        # check if screening unit open but not completed yet, and don't allow concurrent assignment if yes
        open_screen_units = [u for u in current_units if u.unit_index == SCREENING_UNIT_INDEX]
        open_screen_agents = [a for u in open_screen_units for a in task_run.db.find_agents(unit_id=u.db_id, status=AssignmentState.ACCEPTED)]
        if len(open_screen_agents) > 0:
            return [], GOPEN

        task_units: List["Unit"] = task_run.get_units()
        unit_assigns: Dict[str, List["Unit"]] = {}
        for unit in task_units:
            assignment_id = unit.assignment_id
            if assignment_id not in unit_assigns:
                unit_assigns[assignment_id] = []
            if task_run.args.blueprint.do_external_annotations:
                # if worker participated in assignment in previous run, ineligible for this run
                if unit.get_assignment_data().shared[0].get("group_id", -1) not in completed_ids:
                    unit_assigns[assignment_id].append(unit)
            else:
                unit_assigns[assignment_id].append(unit)

        # Cannot pair with self
        units: List["Unit"] = []
        for unit_set in unit_assigns.values():
            is_self_set = map(lambda u: u.worker_id == worker.db_id, unit_set)
            if not any(is_self_set):
                units += unit_set

        # worker cannot be assigned a unit that contains previous work that came from them
        nonself_units = []
        for unit in units:
            assignment_data = unit.get_assignment().get_assignment_data()
            for subtask in assignment_data.shared:
                if subtask.get("origin_worker_id", None) == worker.worker_name:
                    break
            else:
                nonself_units.append(unit)

        # Valid units must be launched and must not be special units (negative indices)
        valid_units = [
            u
            for u in nonself_units
            if u.get_status() == AssignmentState.LAUNCHED and u.unit_index >= 0
        ]
        logger.debug(f"Found {len(valid_units)} available units")

        # Should load cached blueprint for SharedTaskState
        blueprint = task_run.get_blueprint()
        ret_units = [
            u
            for u in valid_units
            if blueprint.shared_state.worker_can_do_unit(worker, u)
        ]

        logger.debug(f"This worker is qualified for {len(ret_units)} unit.")
        logger.debug(f"First 3 units found for worker are {ret_units[:3]}.")
        return ret_units, None

    def _register_agent(self, packet: Packet, channel_info: ChannelInfo):
        """Process an agent registration packet to register an agent"""
        # First see if this is a reconnection
        crowd_data = packet.data["provider_data"]
        agent_registration_id = crowd_data["agent_registration_id"]
        logger.debug(f"Incoming request to register agent {agent_registration_id}.")
        if agent_registration_id in self.agents_by_registration_id:
            agent = self.agents_by_registration_id[agent_registration_id].agent
            # Update the source channel, in case it has changed
            self.agents[agent.get_agent_id()].used_channel_id = channel_info.channel_id
            if agent.db_status == 'completed':
                # alert this assignment is already finished
                self.message_queue.append(
                    Packet(
                        packet_type=PACKET_TYPE_PROVIDER_DETAILS,
                        sender_id=SYSTEM_CHANNEL_ID,
                        receiver_id=channel_info.channel_id,
                        data={
                            "request_id": packet.data["request_id"],
                            "agent_id": COMPLETED,
                        },
                    )
                )
                logger.debug(
                    f"Found existing agent_registration_id {agent_registration_id}, "
                    f"for a completed assignment."
                )
                return
            if channel_info.job.task_runner.args["blueprint"]["do_collect_dialogue"]:
                # disallow reconnects
                self.message_queue.append(
                    Packet(
                        packet_type=PACKET_TYPE_PROVIDER_DETAILS,
                        sender_id=SYSTEM_CHANNEL_ID,
                        receiver_id=channel_info.channel_id,
                        data={
                            "request_id": packet.data["request_id"],
                            "agent_id": DISALLOWED_RECONNECT,
                        },
                    )
                )
                logger.debug(
                    f"Found existing agent_registration_id {agent_registration_id}, "
                    f"terminating due to incompatibility with collecting dialogues."
                )
                agent.update_status(AgentState.STATUS_RETURNED)
                # agent.update_status(DISALLOWED_RECONNECT)
                del self.agents_by_registration_id[agent_registration_id]
                raise AgentReturnedError(agent.db_id)
            else:
                if agent.get_status() != 'timeout': # reconnection attempt of ongoing assignment
                    self.message_queue.append(
                        Packet(
                            packet_type=PACKET_TYPE_PROVIDER_DETAILS,
                            sender_id=SYSTEM_CHANNEL_ID,
                            receiver_id=channel_info.channel_id,
                            data={
                                "request_id": packet.data["request_id"],
                                "agent_id": agent.get_agent_id(),
                            },
                        )
                    )
                    logger.debug(
                        f"Found existing agent_registration_id {agent_registration_id}, "
                        f"reconnecting to {agent}."
                    )
                    return
                else: # agent timedout last time; need to clear it and then remake agent
                    del self.agents_by_registration_id[agent_registration_id]
                    logger.debug(
                        f"Found existing agent_registration_id {agent_registration_id}, "
                        f"but {agent} timed out so need to create new agent for this link."
                    )

        # Process a new agent
        task_runner = channel_info.job.task_runner
        task_run = task_runner.task_run
        worker_id = crowd_data["worker_id"]
        worker = Worker.get(self.db, worker_id)

        # get the list of tentatively valid units
        units, error = self.custom_get_valid_units(worker, task_run)
        if len(units) == 0:
            self.message_queue.append(
                Packet(
                    packet_type=PACKET_TYPE_PROVIDER_DETAILS,
                    sender_id=SYSTEM_CHANNEL_ID,
                    receiver_id=channel_info.channel_id,
                    data={"request_id": packet.data["request_id"], "agent_id": error},
                )
            )
            logger.debug(
                f"agent_registration_id {agent_registration_id}, had no valid units."
            )
            return

        # If there's onboarding, see if this worker has already been disqualified
        worker_id = crowd_data["worker_id"]
        worker = Worker.get(self.db, worker_id)
        blueprint = task_run.get_blueprint(args=task_runner.args)
        if isinstance(blueprint, OnboardingRequired) and blueprint.use_onboarding:
            if worker.is_disqualified(blueprint.onboarding_qualification_name):
                self.message_queue.append(
                    Packet(
                        packet_type=PACKET_TYPE_PROVIDER_DETAILS,
                        sender_id=SYSTEM_CHANNEL_ID,
                        receiver_id=channel_info.channel_id,
                        data={
                            "request_id": packet.data["request_id"],
                            "agent_id": None,
                        },
                    )
                )
                logger.debug(
                    f"Worker {worker_id} is already disqualified by onboarding "
                    f"qual {blueprint.onboarding_qualification_name}."
                )
                return
            elif not worker.is_qualified(blueprint.onboarding_qualification_name):
                createdOnboardingAgents = self.db.find_onboarding_agents(worker_id=worker_id, task_id=task_run.task_id,
                                                                         task_type=task_run.task_type, task_run_id=task_run.db_id)
                if len(createdOnboardingAgents) == 1:
                    agent = createdOnboardingAgents[0]
                    # Update the source channel, in case it has changed
                    self.agents[agent.get_agent_id()].used_channel_id = channel_info.channel_id
                    # Send a packet with onboarding information
                    self.message_queue.append(
                        Packet(
                            packet_type=PACKET_TYPE_PROVIDER_DETAILS,
                            sender_id=SYSTEM_CHANNEL_ID,
                            receiver_id=channel_info.channel_id,
                            data={
                                "request_id": packet.data["request_id"],
                                "agent_id": agent.get_agent_id(),
                            },
                        )
                    )
                    logger.debug(
                        f"Found existing onboardingAgent {agent.get_agent_id()}, "
                        f"for worker {worker_id}."
                    )
                    return
                elif len(createdOnboardingAgents) > 1:
                    raise Exception('More than one Onboarding Agent found!')

                onboard_data = blueprint.get_onboarding_data(worker.db_id)
                onboard_agent = OnboardingAgent.new(self.db, worker, task_run)
                onboard_agent.state.set_init_state(onboard_data)
                agent_info = AgentInfo(
                    agent=onboard_agent, used_channel_id=channel_info.channel_id
                )
                onboard_id = onboard_agent.get_agent_id()
                # register onboarding agent
                self.agents[onboard_id] = agent_info
                self.onboarding_packets[onboard_id] = packet
                self.message_queue.append(
                    Packet(
                        packet_type=PACKET_TYPE_PROVIDER_DETAILS,
                        sender_id=SYSTEM_CHANNEL_ID,
                        receiver_id=channel_info.channel_id,
                        data={
                            "request_id": packet.data["request_id"],
                            "agent_id": onboard_id,
                            "onboard_data": onboard_data,
                        },
                    )
                )

                logger.debug(
                    f"{worker} is starting onboarding thread with "
                    f"onboarding {onboard_agent}."
                )

                # Create an onboarding thread
                onboard_thread = threading.Thread(
                    target=self._launch_and_run_onboarding,
                    args=(agent_info, channel_info.job.task_runner),
                    name=f"Onboard-thread-{onboard_id}",
                )

                onboard_agent.update_status(AgentState.STATUS_ONBOARDING)
                agent_info.assignment_thread = onboard_thread
                onboard_thread.start()
                return
        if isinstance(blueprint, ScreenTaskRequired) and blueprint.use_screening_task:
            if (
                blueprint.worker_needs_screening(worker)
                and blueprint.should_generate_unit()
            ):
                screening_data = blueprint.get_screening_unit_data()
                if screening_data is not None:
                    launcher = channel_info.job.task_launcher
                    assert (
                        launcher is not None
                    ), "Job must have launcher to use screening tasks"
                    units = [launcher.launch_screening_unit(screening_data)]
                else:
                    self.message_queue.append(
                        Packet(
                            packet_type=PACKET_TYPE_PROVIDER_DETAILS,
                            sender_id=SYSTEM_CHANNEL_ID,
                            receiver_id=channel_info.channel_id,
                            data={
                                "request_id": packet.data["request_id"],
                                "agent_id": XSCREEN,
                            },
                        )
                    )
                    logger.debug(
                        f"No screening units left for {agent_registration_id}."
                    )
                    return
        if isinstance(blueprint, UseGoldUnit) and blueprint.use_golds:
            if blueprint.should_produce_gold_for_worker(worker):
                gold_data = blueprint.get_gold_unit_data_for_worker(worker)
                if gold_data is not None:
                    launcher = channel_info.job.task_launcher
                    units = [launcher.launch_gold_unit(gold_data)]
                else:
                    self.message_queue.append(
                        Packet(
                            packet_type=PACKET_TYPE_PROVIDER_DETAILS,
                            sender_id=SYSTEM_CHANNEL_ID,
                            receiver_id=channel_info.channel_id,
                            data={
                                "request_id": packet.data["request_id"],
                                "agent_id": None,
                            },
                        )
                    )
                    logger.debug(f"No gold units left for {agent_registration_id}...")
                    return

        # Not onboarding, so just register directly
        self._assign_unit_to_agent(packet, channel_info, units)

    def _assign_unit_to_agent(
        self, packet: Packet, channel_info: ChannelInfo, units: List["Unit"]
    ):
        """
        Handle creating an agent for the specific worker to register an agent
        Modified to set randomized annotations after agent creation in agent state
        """

        crowd_data = packet.data["provider_data"]
        task_run = channel_info.job.task_runner.task_run
        crowd_provider = channel_info.job.provider
        worker_id = crowd_data["worker_id"]
        worker = Worker.get(self.db, worker_id)

        logger.debug(
            f"Worker {worker_id} is being assigned one of " f"{len(units)} units."
        )

        reserved_unit = None
        while len(units) > 0 and reserved_unit is None:
            unit = units.pop(0)
            reserved_unit = task_run.reserve_unit(unit)
        if reserved_unit is None:
            self.message_queue.append(
                Packet(
                    packet_type=PACKET_TYPE_PROVIDER_DETAILS,
                    sender_id=SYSTEM_CHANNEL_ID,
                    receiver_id=channel_info.channel_id,
                    data={"request_id": packet.data["request_id"], "agent_id": None},
                )
            )
        else:
            agent = crowd_provider.AgentClass.new_from_provider_data(
                self.db, worker, unit, crowd_data
            )
            agent.state.do_interactive_offline_annotations_randomized = self._randomize_interactive_offline_annotations(task_run.args.blueprint.do_interactive_offline_annotations, groups=["likert", "comparative"])
            logger.debug(f"Created agent {agent}, {agent.db_id}.")
            self.message_queue.append(
                Packet(
                    packet_type=PACKET_TYPE_PROVIDER_DETAILS,
                    sender_id=SYSTEM_CHANNEL_ID,
                    receiver_id=channel_info.channel_id,
                    data={
                        "request_id": packet.data["request_id"],
                        "agent_id": agent.get_agent_id(),
                    },
                )
            )
            agent_info = AgentInfo(agent=agent, used_channel_id=channel_info.channel_id)
            self.agents[agent.get_agent_id()] = agent_info
            self.agents_by_registration_id[
                crowd_data["agent_registration_id"]
            ] = agent_info

            # Launch individual tasks
            if unit.unit_index < 0 or not channel_info.job.task_runner.is_concurrent:
                unit_thread = threading.Thread(
                    target=self._launch_and_run_unit,
                    args=(unit, agent_info, channel_info.job.task_runner),
                    name=f"Unit-thread-{unit.db_id}",
                )
                agent_info.assignment_thread = unit_thread
                unit_thread.start()
            else:
                # See if the concurrent unit is ready to launch
                assignment = unit.get_assignment()
                agents = assignment.get_agents()
                if None in agents:
                    agent.update_status(AgentState.STATUS_WAITING)
                    return  # need to wait for all agents to be here to launch

                # Launch the backend for this assignment
                agent_infos = [self.agents[a.db_id] for a in agents if a is not None]

                assign_thread = threading.Thread(
                    target=self._launch_and_run_assignment,
                    args=(assignment, agent_infos, channel_info.job.task_runner),
                    name=f"Assignment-thread-{assignment.db_id}",
                )

                for agent_info in agent_infos:
                    agent_info.agent.update_status(AgentState.STATUS_IN_TASK)
                    agent_info.assignment_thread = assign_thread

                assign_thread.start()


    def _randomize_interactive_offline_annotations(self, annotation_ls, groups=["comparative", "likert"]):
        # randomize each internal list s.t.
        #   the same type of annotation (e.g. "likert" vs "comparative") stay grouped in specified order seen in arg 'groups'
        #   within group is randomized
        all_new_annots = []
        for ls in annotation_ls:
            grouped = self._get_annotation_groups(ls, groups)
            randomized = []
            for g in groups:
                annots = grouped[g]
                random.shuffle(annots)
                randomized.extend(annots)
            all_new_annots.append(randomized)
        return all_new_annots

    def _get_annotation_groups(self, ls, groups):
        grouped = {g: [] for g in groups}
        for annot in ls:
            for g in groups:
                if g in annot:
                    grouped[g].append(annot)
        return grouped

    # def _launch_and_run_onboarding(
    #     self, agent_info: "AgentInfo", task_runner: "TaskRunner"
    # ):
    #     """Launch a thread to supervise the completion of onboarding for a task"""
    #     tracked_agent = agent_info.agent
    #     onboarding_id = tracked_agent.get_agent_id()
    #     assert isinstance(tracked_agent, OnboardingAgent), (
    #         "Can launch onboarding for OnboardingAgents, not Agents"
    #         f", got {tracked_agent}"
    #     )
    #     try:
    #         logger.debug(f"Launching onboarding for {tracked_agent}")
    #         task_runner.launch_onboarding(tracked_agent)
    #         if tracked_agent.get_status() == AgentState.STATUS_WAITING:
    #             # The agent completed the onboarding task
    #             self._register_agent_from_onboarding(tracked_agent)
    #         else:
    #             logger.info(
    #                 f"Onboarding agent {onboarding_id} disconnected or errored, "
    #                 f"final status {tracked_agent.get_status()}."
    #             )
    #             self._send_status_update(agent_info)
    #     except Exception as e:
    #         logger.warning(f"Onboarding for {tracked_agent} failed with exception {e}")
    #         import traceback
    #
    #         traceback.print_exc()
    #         task_runner.cleanup_onboarding(tracked_agent)
    #     finally:
    #         send_packet = Packet(
    #                 packet_type=PACKET_TYPE_SUBMIT_ONBOARDING,
    #                 sender_id=onboarding_id,
    #                 receiver_id=SYSTEM_CHANNEL_ID,
    #                 data={
    #                     "clear_onboarding_agent": True
    #                 },
    #             )
    #         channel_info = self.channels[agent_info.used_channel_id]
    #         channel_info.channel.send(send_packet)
    #         del self.agents[onboarding_id]
    #         del self.onboarding_packets[onboarding_id]