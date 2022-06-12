#!/usr/bin/env python3

# Copyright (c) Facebook, Inc. and its affiliates.
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import time
import os
import json
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import random

from parlai.core.agents import create_agent_from_shared
from parlai.core.message import Message
from parlai.core.worlds import validate
from parlai.crowdsourcing.utils.acceptability import AcceptabilityChecker
from parlai.crowdsourcing.utils.worlds import CrowdOnboardWorld, CrowdTaskWorld
from parlai.crowdsourcing.utils.mturk import get_mturk_id_from_mephisto_wrapper
from mephisto.data_model.packet import Packet

from bot_agent import TurkLikeAgent
from constants import (
    ONBOARD_CONFIG,
    ONBOARD_FAIL,
    ONBOARD_SUCCESS,
)
from utils import Compatibility

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from mephisto.abstractions.blueprints.parlai_chat.parlai_chat_task_runner import (
        MephistoAgentWrapper,
    )

import sqlite3
from mephisto.abstractions.database import (
    MephistoDB,
    MephistoDBException,
    EntryAlreadyExistsException,
    EntryDoesNotExistException,
)
from mephisto.abstractions.databases.local_database import is_key_failure, is_unique_failure

from behavior_analysis_blueprint import process_conversations_needed

class BaseBehaviorAnalysisWorld(CrowdTaskWorld, ABC):
    def __init__(self, opt, agent, bots, model_name):
        super().__init__(opt, agent)

        # num_turns turns for a single side, and really it appears to be
        # (num_turns + 1) * 2 total b/c of the "Hi!" and first bot utterance

        num_turns = opt['num_turns']
        max_resp_time = opt['max_resp_time']

        self.opt = opt
        self.model_name = model_name

        self.bots = bots
        self.bot_idx = 0
        self.bot = self.bots[self.bot_idx]

        self.task_turn_idx = 0
        self.num_turns = num_turns

        self.dialog = {}
        self.chatModels = []
        self.chatDone = False
        self.annotations = {}
        self.tag = f'conversation_id {agent.mephisto_agent.db_id}'
        self.task_type = 'sandbox' if opt['is_sandbox'] else 'live'
        self.chat_done = False # ENDS ENTIRE TASK
        self.endable = False
        self.ended_chat = False
        self.check_acceptability = opt['check_acceptability']
        self.acceptability_checker = AcceptabilityChecker()
        self.block_qualification = opt['block_qualification']

        self.final_chat_data = None
        # TODO: remove this attribute once chat data is only stored in the Mephisto
        #  TaskRun for this HIT (see .get_custom_task_data() docstring for more
        #  information)

        # below are timeout protocols
        self.max_resp_time = max_resp_time  # in secs
        print(f'Creating {self.__class__.__name__} for tag {self.tag} with {num_turns} turns.')

    # def __add_problem_data_to_utterance(self, p, turn_idx: int):
    #     """
    #     Attach problem data to the bot's prior utterance, given by turn_idx.
    #     """
    #     print(p)
    #     assert (self.dialog[turn_idx]['agent_idx'] == 1), 'Problem data must be attached to a bot utterance.'
    #     assert ('problem_data' not in self.dialog[turn_idx]), "Don't overwrite existing problem data!"
    #     self.dialog[turn_idx]['problem_data'] = p

    def end_chat(self):
        # print('Chat is done')
        self.ended_chat = True
        # self.chat_done = True
        # Save the final chat data
        self.final_chat_data = self.get_final_chat_data()
        self.agent.mephisto_agent.state.data['final_chat_data'] = self.final_chat_data

        # Soft-block the worker if there were acceptability violations
        acceptability_violations = self.final_chat_data['acceptability_violations'][0]
        if (acceptability_violations is not None and acceptability_violations != ''):
            print(f'**NOTE** Acceptability violations detected: {acceptability_violations}')
            # Grant the failed qualification
            self.agent.mephisto_agent.get_worker().grant_qualification(self.block_qualification, 1)

    def _add_items_to_message(self, agent, act):
        if agent == self.bot:
            Compatibility.backward_compatible_force_set(act, 'agent_idx', 1)
            if hasattr(self.bot, 'agent_id') and self.bot.agent_id:
                # Set speaker name as self.bot_agent_id otherwise bot name like "TransformerGenerator" is used
                Compatibility.backward_compatible_force_set(act, 'id', self.bot.agent_id)
        Compatibility.backward_compatible_force_set(act, 'botmodel', self.bot.worker_id)

    def parley(self):
        # print(f'{self.__class__.__name__}:{self.tag}: is at turn {self.task_turn_idx}, with {self.num_turns} pairs of turns needed...')

        if self.task_turn_idx == 0:
            self._run_initial_turn()
            self.task_turn_idx += 2
            return

        # print(f'{self.__class__.__name__}:{self.tag}: About to act with task turn idx: {self.task_turn_idx}')

        if not self.chat_done and not self.ended_chat: # on first task of collecting dialogue
            acts = [None, None]
            for idx, agent in enumerate([self.agent, self.bot]):
                acts[idx] = agent.act(timeout=self.max_resp_time)
                if agent == self.agent and acts[idx].get("packet_type", "") == "annotations":
                    # annotation message received, but state updated already through agent.act(), so only need to set
                    # class attribute
                    self.annotations = acts[idx]["data"]
                    return
                elif agent == self.agent and acts[idx].get("packet_type", "") == "end_dialogue":
                    self.end_chat()
                    return
                else:
                    self._add_items_to_message(agent, acts[idx])
                    acts[idx] = Message(Compatibility.maybe_fix_act(acts[idx])).json_safe_payload()
                    # print(f'Got act for agent idx {idx}, act was: {acts[idx]} and self.task_turn_idx: {self.task_turn_idx}.')

                    self.dialog.setdefault(self.bot.worker_id, []).append(acts[idx])

                    self._postprocess_acts(acts=acts, agent_idx=idx)
                    for other_agent in [self.agent, self.bot]:
                        if other_agent != agent:
                            other_agent.observe(validate(acts[idx]))

                    self.task_turn_idx += 1
                    # print(f"On turn {self.task_turn_idx} out of required {self.num_turns}")

    @abstractmethod
    def _run_initial_turn(self) -> None:
        """
        Runs logic for the first turn of the human and the bot.
        """

    def _postprocess_acts(self, acts: List[dict], agent_idx: int):
        """
        Optionally perform further processing of the acts.

        Useful for subclasses. Will be executed after saving act data to self.dialog but
        before showing the act to the other agent.
        """

    def shutdown(self):
        # Runs when task is submitted!

        if self.chat_done:
            self.opt['run_statistics'][self.model_name] += 1

            # update worker to chatbot database
            db = self.agent.mephisto_agent.db
            worker_id = self.agent.mephisto_agent.worker_id
            with db.table_access_condition, db._get_connection() as conn:
                c = conn.cursor()
                results = c.execute(
                    "SELECT * FROM workers_to_chatbots WHERE worker_id = (?);", (worker_id,)
                )
                results = results.fetchall()
                if len(results) > 1:
                    raise Exception(f"There are too many rows for this worker {worker_id} in the workers_to_chatbots DB")
                elif len(results) == 1:
                    previous_chats_str = results[0]["chatbots"]
                    previous_chats = process_conversations_needed(previous_chats_str)
                else:
                    previous_chats = {}

            previous_chats.setdefault(self.model_name, 0)
            previous_chats[self.model_name] += 1
            previous_chats_str = ','.join([f'{k}:{v}' for k, v in previous_chats.items()])
            with db.table_access_condition, db._get_connection() as conn:
                c = conn.cursor()
                try:
                    if len(results) > 0:
                        c.execute(
                            "UPDATE workers_to_chatbots SET chatbots = (?) WHERE worker_id = (?);",
                            (previous_chats_str, worker_id,)
                        )
                    else:
                        c.execute(
                            "INSERT INTO workers_to_chatbots VALUES (?, ?);",
                            (worker_id, previous_chats_str)
                        )
                except sqlite3.IntegrityError as e:
                    if is_key_failure(e):
                        raise EntryDoesNotExistException()
                    raise MephistoDBException(e)

        print(
            'Runs completed per model: '
            + ', '.join(
                f'{model}: {count:d}'
                for model, count in self.opt['run_statistics'].items()
            )
        )

        self.agent.shutdown()

    def episode_done(self):
        return self.ended_chat

    def get_final_chat_data(self) -> Dict[str, Any]:
        """
        Return specific info about the conversation, the context, acceptability, etc.
        """

        if self.check_acceptability:
            human_messages, violation_types = self._prepare_acceptability_checking()
            violations_string = self.acceptability_checker.check_messages(
                messages=human_messages,
                is_worker_0=False,
                violation_types=violation_types,
            )
        else:
            violations_string = None

        data = {
            'dialog': self.dialog,
            'chatModels': self.chatModels,
            'chatDone': self.ended_chat,
            'annotations': self.annotations,
            'workers': [get_mturk_id_from_mephisto_wrapper(self.agent)],
            'bad_workers': [],
            'acceptability_violations': (violations_string,),
            'hit_ids': [self.agent.mephisto_agent.task_run_id],
            'assignment_ids': [self.agent.mephisto_agent.assignment_id],
            'task_description': {
                'annotations_config': self.opt['annotations_config'],
                'model_nickname': self.bot.worker_id,
                'model_file': self.bot.model_agent.opt.get('model_file'),
                'model_opt': self.bot.model_agent.opt,
            },
        }
        # TODO: once the analysis scripts are fully switched over to DataBrowser, remove
        #  the 'workers' and 'assignment_ids' keys, which will now be duplicated in the
        #  returned Unit
        # TODO: 'bad_workers' is for compatibility. Before, it was only non-empty if a
        #  worker abandoned, returned, etc. a HIT, but now we don't even save chat
        #  data in that case. Remove this key once fully once on DataBrowser
        if self.check_acceptability:
            data['acceptability_violations'] = (violations_string,)
            # Make a tuple for compatibility with a human/human conversation in
            # which we check both sides for acceptability

        return data

    def get_custom_task_data(self):
        """
        Retrieves the final chat data for storage in the Mephisto database.

        TODO: the final chat data is currently stored both in
         mephisto.blueprint.chat_data_folder and in the Mephisto database. It'd be best
         to remove the chat_data_folder arg completely, and to move the current logic in
         self.get_final_chat_data() into this method, in order to have a single storage
         location.
        """
        return self.final_chat_data

    def _prepare_acceptability_checking(self) -> Tuple[List[str], List[str]]:
        """
        Return the list of human messages and the list of acceptability types to check.
        """
        human_messages = [
            message['text'] for message in self.dialog if message['agent_idx'] == 0
        ]
        violation_types = ['min_words', 'all_caps', 'exact_match', 'safety']
        return human_messages, violation_types


class BehaviorAnalysisWorld(BaseBehaviorAnalysisWorld):
    """
    Version of BaseBehaviorAnalysisWorld for chatting without images.

    Has support for features that are currently not supported by the image-chat version
    of this task, like personas and BST-style seed utterances.
    """

    def __init__(self, opt, agent, bots, model_name, context_info: Optional[dict] = None):
        super().__init__(opt, agent=agent, bots=bots, model_name=model_name)

        if context_info is not None:
            self.context_info = context_info
            self.personas = [
                self.context_info['persona_1_strings'],
                self.context_info['persona_2_strings'],
            ]
        else:
            self.context_info = {}
            self.personas = None

    def _run_initial_turn(self) -> None:
        """
        Run the initial turn for both the human and the bot.

        Optionally show the bot its persona. If we are in BST conversation mode, show 2
        previous BST utterances to both the human and the bot; if we are in Meena-like
        conversation mode, show "Hi!" to the human and the bot and let the bot respond
        accordingly.
        """

        control_msg = {"episode_done": False}

        if self.opt['include_persona'] and 'blender' in self.bot.worker_id:
            # The Bot agent
            # We add the personas and 1/3 of the time WoW topic as the
            # first utterance in the history.
            # Previously for BST task, we also had a big first utterance
            # that gave instructions. Removing that for this task.
            persona_strings = [s.strip() for s in self.personas[1]]
            persona_utterance = self._get_persona_utterance(
                persona_strings=persona_strings,
                is_bot=True,
            )
            message = control_msg.copy()
            message['text'] = persona_utterance
            # The bot seeing its persona does not count as a "turn"
            print(f'{self.bot.worker_id} observing persona!')
            self.bot.observe(validate(message), increment_turn=False)

        if self.opt['conversation_start_mode'] == 'blended_skill_talk':
            print('[Displaying first utterances as per BST task.]')
            # Display the previous two utterances
            human_first_msg = {
                'episode_done': False,
                'id': self.agent.id,
                'text': self.context_info['person1_seed_utterance'],
                'fake_start': True,
                'agent_idx': 0,
            }
            for k, v in control_msg.items():
                human_first_msg[k] = v
            bot_first_msg = {
                'episode_done': False,
                'id': self.bot.id,
                'text': self.context_info['person2_seed_utterance'],
                'fake_start': True,
                'agent_idx': 1,
            }
            print(f'human_first_msg: {human_first_msg}, bot_first_msg: {bot_first_msg}')

            self.dialog.setdefault(self.bot.worker_id, []).append(human_first_msg)
            self.dialog.setdefault(self.bot.worker_id, []).append(bot_first_msg)

            for observer in [self.agent, self.bot]:
                observer.observe(validate(human_first_msg))
                observer.observe(validate(bot_first_msg))

        elif self.opt['conversation_start_mode'] == 'hi':
            print('[Displaying "Hi!" only as per Meena task.]')
            human_first_msg = {
                'episode_done': False,
                'id': self.agent.id,
                'text': 'Hi!',
                'fake_start': True,
                'agent_idx': 0,
            }
            for k, v in control_msg.items():
                human_first_msg[k] = v
            self._add_items_to_message(self.agent, human_first_msg)
            self.dialog.setdefault(self.bot.worker_id, []).append(human_first_msg)

            self.agent.observe(validate(human_first_msg))
            self.bot.observe(validate(human_first_msg))

            first_bot_act = self.bot.act()
            first_bot_act = Compatibility.maybe_fix_act(first_bot_act)
            self._add_items_to_message(self.bot, first_bot_act)

            self.agent.observe(validate(first_bot_act))

            self.dialog.setdefault(self.bot.worker_id, []).append(first_bot_act)

        else:
            raise ValueError(
                f"Conversation start mode {self.opt['conversation_start_mode']} "
                f"not recognized!"
            )

    def _get_persona_utterance(
        self,
        persona_strings: Optional[List[str]] = None,
        context_dataset: Optional[str] = None,
        additional_context: Optional[str] = None,
        is_bot: bool = False,
    ):
        if is_bot:
            # Pass back the original context
            persona_pieces = [f"your persona: {str_}" for str_ in persona_strings]
            if context_dataset == 'wizard_of_wikipedia':
                additional_context_pieces = [additional_context]
            else:
                additional_context_pieces = []
            full_context = '\n'.join(persona_pieces + additional_context_pieces)
            print(f'FULL CONTEXT: {full_context}')
            return full_context
        else:
            if context_dataset == 'convai2':
                last_sentence = 'Pretend that the conversation has already begun.'
            elif context_dataset == 'empathetic_dialogues':
                last_sentence = (
                    f'Pretend that the conversation has already begun, and that you '
                    f'had been talking about the following situation: '
                    f'<b>"{additional_context}"</b>'
                )
            elif context_dataset == 'wizard_of_wikipedia':
                last_sentence = (
                    f'Pretend that the conversation has already begun, and that you '
                    f'had been talking about <b>{additional_context}</b>.'
                )
            else:
                raise ValueError('Context dataset unrecognized!')
            joined_personas = '\n'.join(persona_strings)
            return (
                f'\nSuccessfully matched with another user! Now let\'s get to know '
                f'each other through the chat. You need to finish at least '
                f'<b>{self.num_turns} chat turns</b>, and after that you can click the '
                f'"Done" button to end the chat.\n\n'
                f'<b>Your character description is:\n<span style="color:blue">{joined_personas}</span></b> '
                '\n\n<b>Remember that you can get to know each '
                'other as your characters, talk about any topic, or talk about a '
                'situation that might have happened to your character.</b>'
                '\n<b>Do not trivially copy the '
                'character descriptions into the message.</b><br><br>'
                f'{last_sentence}'
            )

    def get_final_chat_data(self) -> Dict[str, Any]:
        """
        Add non-image-chat-specific fields to the final chat data.
        """
        data = super().get_final_chat_data()
        context_data = {
            'personas': self.personas[1] if self.personas else None,
            'context_dataset': self.context_info.get('context_dataset'),
            'person1_seed_utterance': self.context_info.get('person1_seed_utterance'),
            'person2_seed_utterance': self.context_info.get('person2_seed_utterance'),
            'additional_context': self.context_info.get('additional_context'),
        }
        data.update(context_data)
        return data

    def _prepare_acceptability_checking(self) -> Tuple[List[str], List[str]]:
        """
        Apply acceptability checking params specific to BST-style conversation.

        The BST mode starts the conversation with two previous utterances, so there
        should be no new greeting. Also, the first human response is one of the previous
        utterances, so it shouldn't get checked.
        """
        human_messages, violation_types = super()._prepare_acceptability_checking()
        if self.opt['conversation_start_mode'] == 'blended_skill_talk':
            violation_types.append('penalize_greetings')
            human_messages = human_messages[1:]
        return human_messages, violation_types


def get_bot_worker(opt: Dict[str, Any], model_name: str) -> TurkLikeAgent:
    """
    Return a bot agent.

    Agent behaves like a crowdsource worker but actually wraps around a dialogue model.
    """
    semaphore = opt['semaphore']
    shared_bot_agents = opt['shared_bot_agents']
    num_turns = opt['num_turns']
    bot_agent = create_agent_from_shared(shared_bot_agents[model_name])
    bot_worker = TurkLikeAgent(
        opt,
        model_name=model_name,
        model_agent=bot_agent,
        num_turns=num_turns,
        semaphore=semaphore,
    )
    return bot_worker


def make_world(opt, agents):

    # Extract important components from opt
    statistics_condition = opt['statistics_condition']
    context_generator = opt['context_generator']

    # Get context: personas, previous utterances, etc.
    if context_generator is not None:
        context_info = context_generator.get_context()
    else:
        context_info = None

    # Decide on a bot to use
    run_statistics = opt['run_statistics']
    with statistics_condition:
        remaining_counts_needed = {
            m: c - run_statistics[m] for (m, c) in opt['conversations_needed'].items()
        }
        print(f'Remaining conversation counts needed: {remaining_counts_needed}')

        # get chatbots that worker already talked to
        db = agents[0].mephisto_agent.db
        worker_id = agents[0].mephisto_agent.worker_id
        with db.table_access_condition, db._get_connection() as conn:
            c = conn.cursor()
            results = c.execute(
                "SELECT * FROM workers_to_chatbots WHERE worker_id = (?);", (worker_id,)
            )
            results = results.fetchall()
            if len(results) > 1:
                raise Exception(f"There are too many rows for this worker {agents} in the workers_to_chatbots DB")
            elif len(results) == 1:
                previous_chats_str = results[0]["chatbots"]
                previous_chats = process_conversations_needed(previous_chats_str)
            else:
                previous_chats = {}

        # select appropriate chatbot
        condition_by_count = {}
        for condition, total_left in remaining_counts_needed.items():
            if total_left > 0:
                prev_count = previous_chats.get(condition, 0)
                condition_by_count.setdefault((prev_count, -1 * total_left), []).append(condition)
        if len(condition_by_count) > 0:
            print('ALL CONDITIONS:', condition_by_count)
            condition_options = sorted(condition_by_count.items())[0][1]
            print('CONDITION OPTIONS:', condition_options)
            model_name = random.choice(condition_options)
        else:
            raise Exception("Error: No available chatbots!")

        print(f'Choosing the "{model_name}" model for the bot.')

    bot_models = model_name.split('|')
    random.shuffle(bot_models)
    bot_workers = [get_bot_worker(opt=opt, model_name=bot_model) for bot_model in bot_models]

    # Set participant names to display
    agents[0].agent_id = "You"
    for bw in bot_workers:
        bw.agent_id = "Partner"

    return BehaviorAnalysisWorld(
        opt, agent=agents[0], bots=bot_workers, model_name=model_name, context_info=context_info
    )


def get_world_params():
    return {"agent_count": 1}
