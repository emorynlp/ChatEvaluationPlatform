#!/usr/bin/env python3

# Copyright (c) Facebook, Inc. and its affiliates.
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import json
import os
import pickle
import random
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from threading import Semaphore, Condition
from typing import Any, Dict, List, Optional, TYPE_CHECKING, Callable
import types
from pathlib import Path

import numpy as np
import torch
import yaml
from mephisto.operations.registry import register_mephisto_abstraction
from mephisto.abstractions.blueprint import Blueprint, SharedTaskState
from mephisto.abstractions.blueprints.mixins.use_gold_unit import GoldUnitSharedState, UseGoldUnit, UseGoldUnitArgs
from mephisto.abstractions.blueprints.mixins.screen_task_required import ScreenTaskSharedState, ScreenTaskRequired, ScreenTaskRequiredArgs
from mephisto.abstractions.blueprints.parlai_chat.parlai_chat_blueprint import (
    ParlAIChatBlueprint,
    SharedParlAITaskState,
    ParlAIChatBlueprintArgs,
    MISSING_SOMETHING_TEXT
)
from mephisto.data_model.assignment import InitializationData

from omegaconf import OmegaConf, DictConfig, MISSING

from bot_agent import TurkLikeAgent
from utils import (
    ImageStack,
    get_context_generator,
)
from parlai.tasks.blended_skill_talk.agents import ContextGenerator

from chat_and_annotate_task_runner import ChatAndAnnotateTaskRunner
from chat_and_annotate_agent_state import ChatAndAnnotateAgentState
from chat_and_annotate_task_builder import ChatAndAnnotateTaskBuilder

from typing import ClassVar, List, Type, Any, Dict, Iterable, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from mephisto.data_model.worker import Worker
    from mephisto.data_model.agent import Agent, OnboardingAgent
    from mephisto.data_model.task_run import TaskRun
    from mephisto.abstractions.blueprint import AgentState, TaskRunner, TaskBuilder
    from mephisto.data_model.assignment import Assignment
    from argparse import _ArgumentGroup as ArgumentGroup
    from mephisto.data_model.task import TaskRun


def get_task_path():
    return os.path.dirname(os.path.realpath(__file__))


BLUEPRINT_TYPE = 'behavior_analysis_blueprint'
IMAGE_CHAT_BLUEPRINT_TYPE = 'model_image_chat_blueprint'


@dataclass
class SharedBaseBehaviorAnalysisTaskState(SharedParlAITaskState):
    """
    Base shared-state class from which all model-chat tasks inherit.
    """

    shared_models: Dict[str, Any] = field(default_factory=dict)

@dataclass
class SharedBehaviorAnalysisTaskState(SharedBaseBehaviorAnalysisTaskState, GoldUnitSharedState, ScreenTaskSharedState):
    context_generator: Optional[ContextGenerator] = None
    conversations_needed: Dict[str, Any] = field(default_factory=dict)
    run_statistics: Dict[str, int] = field(default_factory=dict)
    onboard_statistics: Dict[str, int] = field(default_factory=dict)
    statistics_condition: Optional[Condition] = None

    validate_onboarding: Callable[[Any], bool] = field(
        default_factory=lambda: (lambda x: x.get("outputs", {}).get("messages", [{}])[-1].get('data', {}).get('onboarding_data', {}).get('success', False))
    )

@dataclass
class BaseBehaviorAnalysisBlueprintArgs(ParlAIChatBlueprintArgs):
    _group: str = field(
        default="BaseBehaviorAnalysisBlueprint",
        metadata={'help': "Args that are common to all model-chat tasks"},
    )
    custom_source_dir: str = field(
        default=os.path.join(get_task_path(), 'frontend'),
        metadata={"help": "Path to frontend code"},
    )
    num_turns: int = field(default=6, metadata={"help": 'minimum number of turns'})
    random_seed: int = field(
        default=42, metadata={"help": 'Seed for random operations'}
    )
    model_opt_path: str = field(
        default="${mephisto.blueprint.task_config_path}/model_opts.yaml",
        metadata={"help": "Path to YAML of opts for each model"},
    )
    task_model_parallel: bool = field(
        default=True,
        metadata={
            "help": 'Whether to load models to be used with model_parallel True.'
        },
    )
    max_resp_time: int = field(
        default=180, metadata={"help": "time limit for entering a dialog message"}
    )
    check_acceptability: bool = field(
        default=False,
        metadata={
            "help": "Check worker's responses against several metrics of acceptability"
        },
    )
    context_seed: int = field(
        default=MISSING,
        metadata={"help": "Set seed for pulling the context info (for testing)"},
    )
    task_config_path: str = field(
        default=os.path.join(get_task_path(), 'task_config'),
        metadata={"help": "Base path to pull task configuration information"},
    )
    left_pane_text_path: str = field(
        default="${mephisto.blueprint.task_config_path}/left_pane_text.html",
        metadata={
            "help": "Path to file of HTML to show on the left-hand pane of the chat window"
        },
    )
    final_rating_question: str = field(
        default='Please rate your partner on a scale of 1-5.',
        metadata={"help": "Text to show when asking worker to make their final rating"},
    )
    max_concurrent_responses: int = field(
        default=1,
        metadata={"help": "Limit on the number of models that can generate at once"},
    )
    override_opt: Dict[str, Any] = field(
        default_factory=dict,
        metadata={
            "help": "Additional args to pass to initialize the context generator "
            "in order to override the parlai parser defaults."
        },
    )

    # annotation specifications

    annotations_config_path: str = field(
        default="",
        metadata={
            "help": 'Path to JSON of annotation categories.'
        },
    )

    # args to setup task components
    chat_startup_instructions_path: str = field(
        default="${mephisto.blueprint.task_config_path}/chat_startup_instructions.html",
        metadata={
            "help": "Path to file of HTML instructions to show on dialogue collection startup"
        },
    )
    do_collect_dialogue: bool = field(
        default=False, metadata={"help": "whether to load a dialogue model for the worker to talk with"}
    )

    num_bots: int = field(
        default=1, metadata={"help": "the number of dialogue models that will be talked to in a single assignment"}
    )

    do_interactive_online_annotations: str = field(
        default="", metadata={"help": "which interactive annotations to present to the worker as dialogue collection progresses"}
    )

    do_interactive_offline_annotations: List[str] = field(
        default_factory=list, metadata={"help": "which interactive annotations to present to the worker after dialogue collection finishes"}
    )

    # external annotation args

    do_external_annotations: bool = field(
        default=True, metadata={"help": "whether to load static dialogues for the worker to annotate"}
    )

    data_jsonl: str = field(
        default=MISSING, metadata={"help": "Path to JSON-L file containing task data"}
    )

    # universal annotation args

    annotation_duration_in_seconds: int = field(
        default=300, metadata={"help": "time limit for completing all annotation tasks"}
    )

    # softblock workers in backend not using qualifications
    worker_blocklist_paths: Optional[str] = field(
        default=None, metadata={"help": "workers ids to not give units to on mturk"}
    )


class BaseBehaviorAnalysisBlueprint(ParlAIChatBlueprint, ABC):
    """
    This Blueprint uses somewhat specialized arguments for turn annotations, manages
    their validation, and also has specialized data storage for the result format.

    It also has options for the onboarding data answers and the annotation bucket
    definitions.
    """

    ArgsClass = BaseBehaviorAnalysisBlueprintArgs
    SharedStateClass = SharedBaseBehaviorAnalysisTaskState

    @classmethod
    def assert_task_args(cls, args: "DictConfig", shared_state: "SharedTaskState") -> None:
        """
        Ensure that arguments are properly configured to launch this task.
        """
        super().assert_task_args(args, shared_state)

        assert (args.blueprint.get("left_pane_text_path", None) is not None), "Must provide a left pane text file"
        full_path = os.path.expanduser(args.blueprint.left_pane_text_path)
        assert os.path.exists(full_path), f"Target left pane text path {full_path} doesn't exist"

        # Currently Hydra overrides the tilde key at lower levels as described here: https://hydra.cc/docs/next/advanced/override_grammar/basic/#grammar
        # Thus the TILDE key cannot be used in replacement for $HOME variable
        # Some hacky solution can probably be achieved but won't be good code so for now this assert is written as a placeholder

        if args.blueprint.get("annotations_config_path", "") != "":
            full_path = os.path.expanduser(args.blueprint.annotations_config_path)
            assert os.path.exists(
                full_path
            ), f"Target annotation config path {full_path} doesn't exist"

    def __init__(self, task_run: "TaskRun", args: "DictConfig", shared_state: "SharedTaskState"):

        # Default conversation initialization
        if args.blueprint.do_collect_dialogue:
            super().__init__(task_run, args=args, shared_state=shared_state)
        random.seed(self.args.blueprint.random_seed)
        np.random.seed(self.args.blueprint.random_seed)
        torch.manual_seed(self.args.blueprint.random_seed)

        # Load task configuration data beyond the task description, as the super does
        # that
        left_pane_path = os.path.expanduser(args.blueprint.left_pane_text_path)
        with open(left_pane_path, "r") as left_pane_file:
            self.left_pane_text = left_pane_file.read()
        self.format_left_pane_text(args)
        chat_startup_instructions_path = os.path.expanduser(args.blueprint.chat_startup_instructions_path)
        with open(chat_startup_instructions_path, "r") as chat_startup_instructions_file:
            self.chat_startup_instructions = chat_startup_instructions_file.read()
        self.annotations_config: Optional[str] = None
        if args.blueprint.get("annotations_config_path", "") != "":
            annotations_config_path = os.path.expanduser(args.blueprint.annotations_config_path)
            with open(annotations_config_path, "r") as annotations_config_file:
                self.annotations_config = annotations_config_file.read()

        semaphore = None
        shared_state.shared_models = None
        if args.blueprint.do_collect_dialogue:
            # Initialize models
            shared_state.shared_models = self._get_shared_models(args)

            # Limits the number of models that can generate at once
            semaphore = Semaphore(args.blueprint.max_concurrent_responses)

        # Move shared state into the world opt, so that it can be used by the world
        shared_state.onboarding_world_opt.update(
            {'skip_onboarding': True}
        )
        # The onboarding checks how well workers annotate conversations, so it should be
        # skipped if we are not annotating
        shared_state.world_opt.update(
            {
                'block_qualification': args.blueprint.block_qualification,
                'semaphore': semaphore,
                'shared_bot_agents': shared_state.shared_models,
                'num_turns': args.blueprint.num_turns,
                'max_resp_time': args.blueprint.max_resp_time,
                'is_sandbox': args.provider.requester_name == 'MOCK_REQUESTER',
                'check_acceptability': args.blueprint.check_acceptability,
                'annotations_config': self.annotations_config
            }
        )

    def format_left_pane_text(self, args: "DictConfig"):
        """
        Modifies self.left_pane_text for code injection.
        """
        pass

    @abstractmethod
    def _get_shared_models(self, args: "DictConfig") -> Dict[str, dict]:
        """
        Return a dictionary whose values are the shared models.
        """

    def get_frontend_args(self) -> Dict[str, Any]:
        """
        Specifies what options within a task_config should be forwarded to the client
        for use by the task's frontend.
        """
        if self.args.blueprint.get('annotations_config_path', '') != '':
            with open(
                self.args.blueprint.annotations_config_path, "r", encoding="utf-8-sig"
            ) as f:
                annotation_buckets = json.loads(f.read())
        else:
            annotation_buckets = None

        onboarding_data = getattr(self, 'onboard_task_data', None)
        processed_onboarding_data = {} if onboarding_data is not None else None
        if onboarding_data is not None:
            for task, task_data in onboarding_data.items():
                processed_onboarding_data[task] = process_static_dialogue_with_answers(task_data)

        return {
            "min_num_turns": self.args.blueprint.num_turns,
            "task_title": self.args.task.get('task_title', None),
            "onboarding_data": processed_onboarding_data,
            "left_pane_text": self.left_pane_text,
            "chat_startup_instructions": self.chat_startup_instructions,
            "frame_height": '100%' if self.args.blueprint.do_collect_dialogue else '0',
            "final_rating_question": self.args.blueprint.final_rating_question,
            "block_mobile": True,
            "annotation_buckets": annotation_buckets,
            'do_collect_dialogue': self.args.blueprint.do_collect_dialogue,
            'num_bots': self.args.blueprint.num_bots,
            'do_interactive_online_annotations': self.args.blueprint.do_interactive_online_annotations,
            'do_interactive_offline_annotations': OmegaConf.to_container(self.args.blueprint.do_interactive_offline_annotations),
            'do_external_annotations': self.args.blueprint.do_external_annotations,
            'taskname': self.args.task.task_name
        }


@dataclass
class BehaviorAnalysisBlueprintArgs(BaseBehaviorAnalysisBlueprintArgs, UseGoldUnitArgs, ScreenTaskRequiredArgs):
    _blueprint_type: str = BLUEPRINT_TYPE
    _group: str = field(
        default="BehaviorAnalysisBlueprint",
        metadata={
            'help': "This task runs conversations between a human and one of a set of "
            "provided models, asking workers to evaluate individual turns and "
            "the overall model quality afterwards."
        },
    )
    conversation_start_mode: str = field(
        default='hi',
        metadata={
            "help": 'Set to "hi" to show "Hi!" at the beginning of the conversation, or '
            'set to a task name to specify a custom context'
        },
    )
    include_persona: bool = field(
        default=False, metadata={"help": "Show persona to the bot"}
    )
    conversations_needed_string: str = field(
        default=MISSING,
        metadata={
            "help": 'Number of convos needed for each model. For example: "modelA:50,modelB:20"'
        },
    )
    max_onboard_time: int = field(
        default=300, metadata={"help": "time limit accepting onboarding"}
    )
    onboard_task_data_path: str = field(
        default=False,
        metadata={
            "help": "Path to JSON containing settings for running onboarding. Not used if not annotating model responses"
        },
    )
    gold_jsonl: Optional[str] = field(
        default=None,
        metadata={
            "help": "Path to JSONL containing gold data units."
        },
    )
    allowed_gold_mistakes: int = field(
        default=0,
        metadata={
            "help": "Number of mistakes that are allowed to pass a gold unit."
        }
    )
    screen_json: Optional[str] = field(
        default=None,
        metadata={
            "help": "Path to JSONL containing screening data."
        },
    )
    world_file: str = field(
        default=os.path.join(get_task_path(), 'worlds.py'),
        metadata={"help": "Path to file containing parlai world"},
    )





@register_mephisto_abstraction()
class BehaviorAnalysisBlueprint(BaseBehaviorAnalysisBlueprint, UseGoldUnit, ScreenTaskRequired):
    """
    Blueprint for behavior analysis without images.

    This blueprint subclasses BaseBehaviorAnalysisBlueprint to provide logic for keeping track
    of how many more conversations are needed per model; this logic is not shared with
    other model-chat blueprints.
    """

    TaskRunnerClass: ClassVar[Type["TaskRunner"]] = ChatAndAnnotateTaskRunner
    AgentStateClass: ClassVar[Type["AgentState"]] = ChatAndAnnotateAgentState
    OnboardingAgentStateClass: ClassVar[Type["AgentState"]] = ChatAndAnnotateAgentState
    TaskBuilderClass: ClassVar[Type["TaskBuilder"]] = ChatAndAnnotateTaskBuilder
    ArgsClass = BehaviorAnalysisBlueprintArgs
    SharedStateClass = SharedBehaviorAnalysisTaskState
    BLUEPRINT_TYPE = BLUEPRINT_TYPE

    @classmethod
    def assert_task_args(cls, args: "DictConfig", shared_state: "SharedTaskState") -> None:
        """
        Ensure that arguments are properly configured to launch this task.
        """
        if args.blueprint.do_collect_dialogue:
            if not isinstance(shared_state.conversations_needed, dict) or len(shared_state.conversations_needed) == 0:
                assert (
                    args.blueprint.get('conversations_needed_string', None) is not None
                ), (
                    "Must provide a string of needed conversations per model if not providing "
                    "a conversations needed dict"
                )
                try:
                    conversations_needed = {}
                    parts = args.blueprint.conversations_needed_string.split(',')
                    for part in parts:
                        model_name, num_string = part.split(':')
                        conversations_needed[model_name] = int(num_string)
                except Exception as e:
                    raise Exception(
                        "Could not create conversations needed dict from given string. "
                        f"Error was {e}.\n"
                        "Be sure the format is like modelA:50,modelB:20"
                    )
            else:
                conversations_needed = shared_state.conversations_needed
            args.blueprint.num_conversations = sum(conversations_needed.values())
            super().assert_task_args(args=args, shared_state=shared_state)
        elif args.blueprint.do_external_annotations:
            if args.blueprint.get("data_jsonl", None) is not None:
                jsonl_file = os.path.expanduser(args.blueprint.data_jsonl)
                assert os.path.exists(jsonl_file), f"Provided JSON-L file {jsonl_file} doesn't exist"

        if args.blueprint.get("annotations_config_path", "") != "" and args.blueprint.get("onboarding_qualification", None):
            # We are going to do annotations, so check for the presence of an onboarding
            # data file that will be used to onboard users into knowing how to do the
            # annotations properly
            assert (
                args.blueprint.get("onboard_task_data_path", None) is not None
            ), "Must provide an onboarding data file"
            full_path = os.path.expanduser(args.blueprint.onboard_task_data_path)
            assert os.path.exists(
                full_path
            ), f"Target onboarding data path {full_path} doesn't exist"

    def __init__(self, task_run: "TaskRun", args: "DictConfig", shared_state: "SharedTaskState"):

        if args.blueprint.get("annotations_config_path", "") != "" and args.blueprint.get("onboarding_qualification", None):
            # We are going to do annotations, so load the onboarding data file that will
            # be used to onboard users into knowing how to do the annotations properly
            onboard_task_data_path = os.path.expanduser(args.blueprint.onboard_task_data_path)
            with open(onboard_task_data_path, "r") as onboard_task_data_file:
                self.onboard_task_data = json.load(onboard_task_data_file)
        else:
            self.onboard_task_data = None

        if args.blueprint.do_collect_dialogue:
            self.do_collect_dialogue = True
            self.do_external_annotations = False
            conversations_needed = process_conversations_needed(args.blueprint.conversations_needed_string)
            self.conversations_needed = conversations_needed
            shared_state.conversations_needed = conversations_needed
            args.blueprint.num_conversations = sum(conversations_needed.values())

            super().__init__(task_run=task_run, args=args, shared_state=shared_state)

            run_statistics = {r: 0 for (r, v) in self.conversations_needed.items()}
            shared_state.run_statistics = run_statistics

            if args.blueprint.include_persona or args.blueprint.conversation_start_mode != 'hi':
                # 'hi' mode does not use a context generator and instead just displays "Hi!"
                # at the start of the conversation
                if args.blueprint.conversation_start_mode == 'hi': # Default to using the context from BlendedSkillTalk
                    task = 'blended_skill_talk'
                else:
                    task = args.blueprint.conversation_start_mode
                context_generator = get_context_generator(override_opt=args.blueprint.override_opt, task=task)
            else:
                context_generator: Optional[ContextGenerator] = None
            shared_state.context_generator = context_generator

            # Lock for editing run statistics between threads
            statistics_condition = Condition()

            # Move shared state into the world and onboarding opts, such that these
            # can be used by the worlds
            shared_state.world_opt.update(
                {
                    'conversations_needed': conversations_needed,
                    'run_statistics': shared_state.run_statistics,
                    'context_generator': context_generator,
                    'statistics_condition': statistics_condition,
                    'conversation_start_mode': args.blueprint.conversation_start_mode,
                    'include_persona': args.blueprint.include_persona,
                }
            )
        elif args.blueprint.do_external_annotations:
            Blueprint.__init__(self, task_run=task_run, args=args, shared_state=shared_state)
            super().__init__(task_run=task_run, args=args, shared_state=shared_state)

            self.full_preview_description = MISSING_SOMETHING_TEXT
            if args.blueprint.get("preview_source", None) is not None:
                preview_source_file = os.path.expanduser(args.blueprint.preview_source)
                assert os.path.exists(
                    preview_source_file
                ), f"Target preview source path {preview_source_file} doesn't exist"
                with open(preview_source_file, "r") as description_fp:
                    self.full_preview_description = description_fp.read()

            self.do_collect_dialogue = False
            self.do_external_annotations = True
            self._initialization_data_dicts: List[Dict[str, Any]] = []

            jsonl_file = os.path.expanduser(args.blueprint.data_jsonl)
            with open(jsonl_file, "r", encoding="utf-8-sig") as jsonl_fp:
                line = jsonl_fp.readline()
                while line:
                    j = json.loads(line)["data"]
                    j = [process_static_dialogue(item) for item in j]
                    self._initialization_data_dicts.append(j)
                    line = jsonl_fp.readline()

            # Now chunk the data into groups of <num_subtasks>
            grouped_data = []
            for i in range(0, len(self._initialization_data_dicts), 1):
                chunk = self._initialization_data_dicts[i: i + 1]
                grouped_data.append(chunk[0])
            self._initialization_data_dicts = grouped_data
            # Last group may have less unless an exact multiple
            print(f'Grouped data into {len(self._initialization_data_dicts)} tasks with {1} subtasks each.')

    def _get_shared_models(self, args: "DictConfig") -> Dict[str, dict]:
        with open(args.blueprint.model_opt_path) as f:
            all_model_opts = yaml.safe_load(f.read())
        active_model_opts = {}
        for modelspec, amt in self.conversations_needed.items():
            if amt > 0:
                models = modelspec.split('|')
                for model in models:
                    active_model_opts[model] = all_model_opts[model]
        # active_model_opts = {
        #     model: opt
        #     for model, opt in all_model_opts.items()
        #     if self.conversations_needed.get(model, 0) > 0
        # }
        return TurkLikeAgent.get_bot_agents(args=args, model_opts=active_model_opts)

    def get_initialization_data(self) -> Iterable["InitializationData"]:
        """
        Return the InitializationData retrieved from the specified stream
        """
        if self.do_collect_dialogue:
            return [
                InitializationData(shared=d, unit_data=[{}] * self.agent_count)
                for d in self._initialization_data_dicts
            ]
        elif self.do_external_annotations:
            if isinstance(self._initialization_data_dicts, types.GeneratorType):
                raise Exception('initialization data is of type generator, which is not supported!')
            else:
                units_file = f'{self.args.task.task_name.replace("_local", "")}_units.json'
                units_mapping = json.load(open(Path('task_config') / 'task_data' / units_file))

                init_data = []
                for item in self._initialization_data_dicts:
                    item_group = item[0]["group_id"]
                    num_units = units_mapping[item_group]
                    if num_units > 0:
                        init_data.append(InitializationData(shared=item, unit_data=[{}] * num_units))

                return init_data
        else:
            raise Exception("Parameters for do_collect_dialogue and do_external_annotations both false!")

    def validate_onboarding(self, worker: "Worker", onboarding_agent: "OnboardingAgent") -> bool:
        """

        """
        shared_state = self.shared_state
        # assert isinstance(
        #     shared_state, OnboardingSharedState
        # ), f"Cannot init onboarding config with {shared_state}, need OnboardingSharedState"
        data = onboarding_agent.state.get_data()
        return shared_state.validate_onboarding(data)

def process_static_dialogue(d):
    new_dialogue = {k: v for k, v in d.items() if "turns" not in k}
    new_dialogue["turns"] = []
    for full_turn in d['turns']:
        agent_idx = 0 if full_turn[0] == 'user' else 1
        new_dialogue["turns"].append({'text': full_turn[1], 'agent_idx': agent_idx})
    if "turns2" in d:
        new_dialogue["turns2"] = []
        for full_turn in d['turns2']:
            agent_idx = 0 if full_turn[0] == 'user' else 1
            new_dialogue["turns2"].append({'text': full_turn[1], 'agent_idx': agent_idx})
    return new_dialogue

def process_static_dialogue_with_answers(d):
    new_dialogue = {k: v for k,v in d.items() if k != "turns"}
    new_dialogue["turns"] = []
    for full_turn in d['turns']:
        agent_idx = 0 if full_turn[0] == 'user' else 1
        if len(full_turn) > 2:
            new_dialogue["turns"].append({'text': full_turn[1], 'agent_idx': agent_idx, 'answers': full_turn[2], 'explanation': full_turn[3]})
        else:
            new_dialogue["turns"].append({'text': full_turn[1], 'agent_idx': agent_idx})
    return new_dialogue

def process_conversations_needed(conversations_needed_string) -> Dict[str, int]:
    """
    Set the number of conversations needed.
    """
    conversations_needed = {}
    parts = conversations_needed_string.split(',')
    for part in parts:
        model_name, num_string = part.split(':')
        conversations_needed[model_name] = int(num_string)

    return conversations_needed