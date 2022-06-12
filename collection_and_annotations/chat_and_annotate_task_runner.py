
import time, random
from typing import cast, ClassVar, List, Type, Any, Union, Dict, TYPE_CHECKING

if TYPE_CHECKING:
    from mephisto.data_model.task_run import TaskRun
    from mephisto.data_model.assignment import InitializationData
    from mephisto.data_model.unit import Unit
    from mephisto.data_model.assignment import Assignment
    from mephisto.data_model.agent import Agent, OnboardingAgent
    from mephisto.abstractions.blueprint import SharedTaskState
    from omegaconf import DictConfig

from mephisto.abstractions.blueprints.parlai_chat.parlai_chat_task_runner import ParlAIChatTaskRunner, MephistoAgentWrapper
from mephisto.data_model.packet import Packet, PACKET_TYPE_AGENT_ACTION, PACKET_TYPE_UPDATE_AGENT_STATUS, PACKET_TYPE_GET_INIT_DATA
from mephisto.abstractions.blueprint import AgentState

import json

class ChatAndAnnotateTaskRunner(ParlAIChatTaskRunner):

    def __init__(self, task_run: "TaskRun", args: "DictConfig", shared_state: "SharedTaskState"):
        super().__init__(task_run, args, shared_state)
        self.is_concurrent = False
        self.annotation_duration_in_seconds = task_run.args.blueprint.annotation_duration_in_seconds

    def get_init_data_for_agent(self, agent: "Agent") -> Dict[str, Any]:
        """
        Return the data for an agent already assigned to a particular unit
        """
        init_state = agent.state.get_init_state()
        if init_state is not None:
            # reconnecting agent, give what we've got, including previous data results
            prev_data = agent.state.get_data()
            init_state['prev_data'] = prev_data["outputs"]
            init_state['do_interactive_offline_annotations_randomized'] = agent.state.do_interactive_offline_annotations_randomized
            return init_state
        else:
            assignment = agent.get_unit().get_assignment()
            assignment_data = self.get_data_for_assignment(assignment)
            if len(assignment_data.shared) != 0 and not assignment_data.shared[0].get('is_screen', False):
                # randomize assignment data
                random.shuffle(assignment_data.shared)
                # randomize annotation tasks per assignment data
                for sample in assignment_data.shared:
                    random.shuffle(sample["annotation_tasks"])
            agent.state.set_init_state(assignment_data.shared)
            new_state = agent.state.get_init_state()
            new_state['prev_data'] = {"messages": []}
            new_state['do_interactive_offline_annotations_randomized'] = agent.state.do_interactive_offline_annotations_randomized
            # add randomized annotations
            assert new_state is not None, "Recently initialized state still None"
            return new_state

    def _run(self, item: Union["Assignment", "Unit"], item_type: str, agents: List["Agent"]):

        if self.task_run.args.blueprint.do_collect_dialogue:  # dialogue collection
            for agent in agents:
                assert agent is not None, "task was not fully assigned"
            opt: Dict[str, Any] = cast("SharedParlAITaskState", self.shared_state).world_opt
            parlai_agents = [MephistoAgentWrapper(a) for a in agents]
            try:
                world = self.parlai_world_module.make_world(  # type: ignore
                    opt, parlai_agents, initialization_data=item.get_assignment_data()
                )
            except TypeError:
                # make_world doesn't ask for initialization_data
                world = self.parlai_world_module.make_world(opt, parlai_agents)  # type: ignore

            world_id = self.get_world_id(item_type, item.db_id)
            self.id_to_worlds[world_id] = world

            for i in range(len(world.bots)):
                world.bot = world.bots[i]
                world.chatModels.append(world.bot.worker_id)

                while not world.episode_done() and \
                        ((item_type == 'assignment' and item.db_id in self.running_assignments)
                         or (item_type == 'unit' and item.db_id in self.running_units)):
                    world.parley()

                packaged_act = Packet(
                    packet_type=PACKET_TYPE_UPDATE_AGENT_STATUS,
                    sender_id="mephisto",
                    receiver_id=agents[0].get_agent_id(),
                    data={"state": {"chat_done": True}},
                )
                agents[0].observe(packaged_act)

                if self.task_run.args.blueprint.do_interactive_offline_annotations:  # perform interactive offline annotations
                    agent = agents[0]
                    agent_act = agent.act(timeout=self.annotation_duration_in_seconds)
                    while not self._parse_data(agent_act).get("completed", False):
                        agent_act = agent.act(timeout=self.annotation_duration_in_seconds)

                if i < len(world.bots) - 1:
                    packaged_act = Packet(
                        packet_type=PACKET_TYPE_UPDATE_AGENT_STATUS,
                        sender_id="mephisto",
                        receiver_id=agents[0].get_agent_id(),
                        data={"state": {"chat_done": False}},
                    )
                    agents[0].observe(packaged_act)

                world.ended_chat = False
                world.task_turn_idx = 0

            agents[0].update_status(AgentState.STATUS_COMPLETED)
            send_packet = Packet(
                packet_type=PACKET_TYPE_UPDATE_AGENT_STATUS,
                sender_id="mephisto",
                receiver_id=agents[0].get_agent_id(),
                data={
                    "state": {
                        "done_text": "You have completed this task. Please submit.",
                        "task_done": True,
                    },
                },
            )
            agents[0].observe(send_packet)
            world.chat_done = True
            world.shutdown()

        elif self.task_run.args.blueprint.do_external_annotations: # perform external offline annotations
            agent = agents[0]
            agent_act = agent.act(timeout=self.annotation_duration_in_seconds)
            while not self._parse_data(agent_act).get("completed", False):
                agent_act = agent.act(timeout=self.annotation_duration_in_seconds)

            agents[0].update_status(AgentState.STATUS_COMPLETED)
            send_packet = Packet(
                packet_type=PACKET_TYPE_UPDATE_AGENT_STATUS,
                sender_id="mephisto",
                receiver_id=agents[0].get_agent_id(),
                data={
                    "state": {
                        "done_text": "You have completed this task. Please submit.",
                        "task_done": True,
                    },
                },
            )
            agents[0].observe(send_packet)

    def run_assignment(self, assignment: "Assignment", agents: List["Agent"]) -> None:
        self._run(assignment, "assigment", agents)

    def run_unit(self, unit: "Unit", agent: "Agent") -> None:
        self._run(unit, "unit", [agent])

    def _parse_data(self, agent_act, onboarding=False):
        if onboarding:
            onboarding_data = agent_act.data.get("onboarding_data", {})
            if isinstance(onboarding_data, str):
                return json.loads(onboarding_data)
            return onboarding_data
        else:
            if "task_data" in agent_act.data:
                data = agent_act.data["task_data"].get("final_data", {})
            else:
                data = agent_act.data
            if isinstance(data, str):
                return json.loads(data)
            return data

    def run_onboarding(self, agent: "OnboardingAgent") -> None:
        """
        Onboarding mimics static annotations task setup
        """
        agent_act = agent.act(timeout=self.annotation_duration_in_seconds)
        while not self._parse_data(agent_act, onboarding=True).get("completed", False):
            agent_act = agent.act(timeout=self.annotation_duration_in_seconds)

    def cleanup_onboarding(self, agent: "OnboardingAgent"):
        """Nothing to clean up"""
        return

    def cleanup_unit(self, unit: "Unit") -> None:
        """Handle cleanup for a specific unit"""
        world_id = self.get_world_id("unit", unit.db_id)
        if world_id in self.id_to_worlds:
            self.id_to_worlds[world_id].shutdown()
            del self.id_to_worlds[world_id]

    def cleanup_assignment(self, assignment: "Assignment") -> None:
        """Handle cleanup for a specific assignment"""
        world_id = self.get_world_id("assignment", assignment.db_id)
        if world_id in self.id_to_worlds:
            self.id_to_worlds[world_id].shutdown()
            del self.id_to_worlds[world_id]
