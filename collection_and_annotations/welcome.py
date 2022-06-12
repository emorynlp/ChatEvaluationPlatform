import curses, webbrowser
from custom_local_architect import CustomLocalArchitect
import math
import os, json, subprocess, time, hydra
from dataclasses import dataclass, field
from typing import Any, List
from omegaconf import DictConfig, OmegaConf

from mephisto.operations.hydra_config import register_script_config
from mephisto.tools.scripts import load_db_and_process_config
from mephisto.operations.operator import Operator, TrackedRun
from mephisto.data_model.task_run import TaskRun
from mephisto.abstractions.blueprints.mixins.onboarding_required import OnboardingRequired
from mephisto.abstractions.blueprint import AgentState
from mephisto.abstractions.database import EntryDoesNotExistException
from mephisto.data_model.qualification import make_qualification_dict, QUAL_NOT_EXIST
from mephisto.operations.task_launcher import TaskLauncher, SCREENING_UNIT_INDEX, GOLD_UNIT_INDEX
from mephisto.operations.registry import (
    get_blueprint_from_type,
    get_crowd_provider_from_type,
    get_architect_from_type,
)
from mephisto.abstractions.blueprints.mixins.use_gold_unit import get_gold_factory, UseGoldUnit
from mephisto.abstractions.blueprints.mixins.screen_task_required import ScreenTaskRequired
from mephisto.data_model.assignment import Assignment
from mephisto.operations.utils import get_mock_requester, get_mephisto_tmp_dir
from mephisto.operations.logger_core import get_logger, set_mephisto_log_level

from parlai.crowdsourcing.utils.mturk import MTurkRunScriptConfig, soft_block_mturk_workers
import worlds as world_module
from behavior_analysis_blueprint import SharedBehaviorAnalysisTaskState, process_static_dialogue_with_answers
from custom_operator import CustomOperator

logger = get_logger(name=__name__, level="debug")

PRE = '>>>'
TASK_DIRECTORY = os.path.dirname(os.path.abspath(__file__))
defaults = ["_self_", {"conf": "example"}]

@dataclass
class ScriptConfig(MTurkRunScriptConfig):
    defaults: List[Any] = field(default_factory=lambda: defaults)
    task_dir: str = TASK_DIRECTORY
    monitoring_log_rate: int = field(
        default=30,
        metadata={
            'help': 'Frequency in seconds of logging the monitoring of the crowdsourcing task'
        },
    )
register_script_config(name='scriptconfig', module=ScriptConfig)

CFG: DictConfig = None

@hydra.main(config_path="hydra_configs", config_name="scriptconfig")
def get_config(cfg: DictConfig):
    global CFG
    CFG = cfg

def custom_needs_gold(units_completed: int, num_correct: int, num_incorrect: int, min_golds: int):
    """
    Return a bool of whether or not a worker needs to be shown a gold unit in the current slot.
    Generally we show a lot of golds to begin with, (up until min_golds), and then scale down.
    """
    # After launching, if the correct golds are less than the min, we need more golds
    if num_correct < min_golds:
        return True

    if units_completed >= 4:
        target_gold = 1
    else:
        target_gold = 0

    completed_gold = num_correct + num_incorrect - min_golds # number of gold units completed (after getting past any startup gold units)

    if completed_gold < target_gold:
        return True
    return False


class Terminal:

    def __init__(self):
        get_config()
        global CFG
        self.db, CFG = load_db_and_process_config(CFG)
        with self.db.table_access_condition:
            conn = self.db._get_connection()
            conn.execute("PRAGMA foreign_keys = 1")
            with conn:
                c = conn.cursor()
                c.execute("""CREATE TABLE IF NOT EXISTS workers_to_chatbots (
                            worker_id INTEGER PRIMARY KEY,
                            chatbots TEXT
                        );
                        """)


    def new_session(self):
        """
        Same as impl.new_task() except:
            CFG and db loaded outside of function
            Uses CustomLocalArchitect, if architect_type == 'local'
            Auto-opens created task run in default browser
        """

        cfg=CFG
        db=self.db
        print(f'\nHydra config:\n{OmegaConf.to_yaml(cfg)}')

        # Update task name when on sandbox or local to ensure data is split.
        task_name = cfg.mephisto.task.get('task_name', 'behavior_analysis')
        architect_type = cfg.mephisto.architect._architect_type
        if architect_type == 'local':
            task_name = f"{task_name}_local"
        elif architect_type == 'mturk_sandbox':
            task_name = f"{task_name}_sandbox"
        cfg.mephisto.task.task_name = task_name
        run_config = cfg.mephisto

        # not using because visible in mturk platform as quals
        # soft_block_qual_name = cfg.mephisto.blueprint.get('block_qualification', f'{task_name}_xsbx')
        # # Default to a task-specific name to avoid soft-block collisions
        # soft_block_mturk_workers(cfg=cfg, db=db, soft_block_qual_name=soft_block_qual_name)

        # Init
        shared_state = SharedBehaviorAnalysisTaskState(world_module=world_module)
        # set up get gold for worker
        gold_data = []
        if run_config.blueprint.gold_jsonl is not None:
            jsonl_file = os.path.expanduser(run_config.blueprint.gold_jsonl)
            with open(jsonl_file, "r", encoding="utf-8-sig") as jsonl_fp:
                line = jsonl_fp.readline()
                while line:
                    j = json.loads(line)["data"]
                    j = [process_static_dialogue_with_answers(item) for item in j]
                    gold_data.append(j)
                    line = jsonl_fp.readline()
            shared_state.get_gold_for_worker = get_gold_factory(gold_data)

        def validate_gold_unit(unit):
            agent = unit.get_assigned_agent()
            if agent is not None:
                data = agent.state.get_data()
                return data['outputs']['messages'][-2]['data']['task_data']['final_data']['gold_mistakes'] <= run_config.blueprint.allowed_gold_mistakes
            return

        gold_validation = UseGoldUnit.create_validation_function(cfg.mephisto, validate_gold_unit)

        # set up screening data
        if run_config.blueprint.screen_json is not None:
            screen_file = os.path.expanduser(run_config.blueprint.screen_json)
            with open(screen_file, "r", encoding="utf-8-sig") as json_fp:
                screen_data = json.load(json_fp)
                processed_screen_data = {}
                for task, task_data in screen_data.items():
                    processed_screen_data[task] = process_static_dialogue_with_answers(task_data)

        def get_screening_data():
            while True:
                d = {'is_screen': True}
                d.update(processed_screen_data)
                yield [d]

        def validate_screening_unit(unit):
            agent = unit.get_assigned_agent()
            if agent is not None:
                data = agent.state.get_data()
                return data['outputs']['messages'][-2]['data']['task_data']['final_data'].get('success', False)
            return

        screening_validation = ScreenTaskRequired.create_validation_function(cfg.mephisto, validate_screening_unit)

        def gold_and_screening_validation(unit):
            if unit.unit_index == SCREENING_UNIT_INDEX:
                screening_validation(unit)
                return
            gold_validation(unit)

        if run_config.blueprint.screen_json is not None and run_config.blueprint.gold_jsonl is not None:
            shared_state.on_unit_submitted = gold_and_screening_validation
            shared_state.worker_needs_gold = custom_needs_gold
            shared_state.screening_data_factory = get_screening_data()
            if 'transitions' in run_config.task.task_name: # mephisto has bug about gold units detection, so removing gold unit qual completely for transitions bc don't want to block based on failed godl units
                shared_state.qualifications += ScreenTaskRequired.get_mixin_qualifications(cfg.mephisto, shared_state)
            else:
                shared_state.qualifications += UseGoldUnit.get_mixin_qualifications(cfg.mephisto) + ScreenTaskRequired.get_mixin_qualifications(cfg.mephisto, shared_state)

        approved_hits = 0 if cfg.mephisto.provider._provider_type == 'mturk_sandbox' else 5000

        shared_state.mturk_specific_qualifications = [
            {
                "QualificationTypeId": "00000000000000000040",
                "Comparator": "GreaterThanOrEqualTo",
                "IntegerValues": [approved_hits],
                "ActionsGuarded": "Accept",
            },
            {
                "QualificationTypeId": "000000000000000000L0",
                "Comparator": "GreaterThanOrEqualTo",
                "IntegerValues": [95],
                "ActionsGuarded": "Accept",
            },
            {
                "QualificationTypeId": "00000000000000000071",
                "Comparator": "In",
                "LocaleValues":[
                    {"Country": "US"},
                    {"Country": "AU"},
                    {"Country": "NZ"},
                    {"Country": "GB"},
                    {"Country": "CA"},
                    {"Country": "IE"}
                ],
                "ActionsGuarded": "DiscoverPreviewAndAccept",
            },
        ]

        operator = CustomOperator(db)

        set_mephisto_log_level(level=run_config.get("log_level", "info"))

        # First try to find the requester:
        requester_name = run_config.provider.requester_name
        requesters = operator.db.find_requesters(requester_name=requester_name)
        if len(requesters) == 0:
            if run_config.provider.requester_name == "MOCK_REQUESTER":
                requesters = [get_mock_requester(operator.db)]
            else:
                raise EntryDoesNotExistException(
                    f"No requester found with name {requester_name}"
                )
        requester = requesters[0]
        requester_id = requester.db_id
        provider_type = requester.provider_type
        assert provider_type == run_config.provider._provider_type, (
            f"Found requester for name {requester_name} is not "
            f"of the specified type {run_config.provider._provider_type}, "
            f"but is instead {provider_type}."
        )

        # Next get the abstraction classes, and run validation
        # before anything is actually created in the database
        blueprint_type = run_config.blueprint._blueprint_type
        architect_type = run_config.architect._architect_type
        BlueprintClass = get_blueprint_from_type(blueprint_type)
        if architect_type == 'local':
            ArchitectClass = CustomLocalArchitect
        else:
            ArchitectClass = get_architect_from_type(architect_type)
        CrowdProviderClass = get_crowd_provider_from_type(provider_type)

        # if shared_state is None:
        #     shared_state = BlueprintClass.SharedStateClass()


        BlueprintClass.assert_task_args(run_config, shared_state)
        ArchitectClass.assert_task_args(run_config, shared_state)
        CrowdProviderClass.assert_task_args(run_config, shared_state)

        # Find an existing task or create a new one
        task_name = run_config.task.get("task_name", None)
        if task_name is None:
            task_name = blueprint_type
            logger.warning(
                f"Task is using the default blueprint name {task_name} as a name, "
                "as no task_name is provided"
            )
        tasks = operator.db.find_tasks(task_name=task_name)
        task_id = None
        if len(tasks) == 0:
            task_id = operator.db.new_task(task_name, blueprint_type)
        else:
            task_id = tasks[0].db_id

        logger.info(f"Creating a task run under task name: {task_name}")

        # Create a new task run
        new_run_id = operator.db.new_task_run(
            task_id,
            requester_id,
            json.dumps(OmegaConf.to_yaml(run_config, resolve=True)),
            provider_type,
            blueprint_type,
            requester.is_sandbox(),
        )
        task_run = TaskRun.get(operator.db, new_run_id)

        try:
            # Register the blueprint with args to the task run,
            # ensure cached
            blueprint = task_run.get_blueprint(
                args=run_config, shared_state=shared_state
            )

            # If anything fails after here, we have to cleanup the architect
            build_dir = os.path.join(task_run.get_run_dir(), "build")
            os.makedirs(build_dir, exist_ok=True)
            architect = ArchitectClass(
                operator.db, run_config, shared_state, task_run, build_dir
            )

            # Setup and deploy the server
            built_dir = architect.prepare()
            task_url = architect.deploy()

            # TODO(#102) maybe the cleanup (destruction of the server configuration?) should only
            # happen after everything has already been reviewed, this way it's possible to
            # retrieve the exact build directory to review a task for real
            architect.cleanup()

            # Create the backend runner
            task_runner = BlueprintClass.TaskRunnerClass(
                task_run, run_config, shared_state
            )

            # Small hack for auto appending block qualification
            existing_qualifications = shared_state.qualifications
            if run_config.blueprint.get("block_qualification", None) is not None:
                existing_qualifications.append(
                    make_qualification_dict(
                        run_config.blueprint.block_qualification, QUAL_NOT_EXIST, None
                    )
                )
            if run_config.blueprint.get("onboarding_qualification", None) is not None:
                existing_qualifications.append(
                    make_qualification_dict(
                        OnboardingRequired.get_failed_qual(
                            run_config.blueprint.onboarding_qualification
                        ),
                        QUAL_NOT_EXIST,
                        None,
                    )
                )
            shared_state.qualifications = existing_qualifications

            # Register the task with the provider
            provider = CrowdProviderClass(operator.db)
            provider.setup_resources_for_task_run(
                task_run, run_config, shared_state, task_url
            )

            initialization_data_iterable = blueprint.get_initialization_data()

            # Link the job together
            job = operator.supervisor.register_job(
                architect, task_runner, provider, existing_qualifications
            )
            if operator.supervisor.sending_thread is None:
                operator.supervisor.launch_sending_thread()
        except (KeyboardInterrupt, Exception) as e:
            logger.error(
                "Encountered error while launching run, shutting down", exc_info=True
            )
            try:
                architect.shutdown()
            except (KeyboardInterrupt, Exception) as architect_exception:
                logger.exception(
                    f"Could not shut down architect: {architect_exception}",
                    exc_info=True,
                )
            raise e

        launcher = TaskLauncher(
            operator.db,
            task_run,
            initialization_data_iterable,
            max_num_concurrent_units=run_config.task.max_num_concurrent_units,
        )
        launcher.create_assignments()
        launcher.launch_units(task_url)
        job.task_launcher = launcher

        operator._task_runs_tracked[task_run.db_id] = TrackedRun(
            task_run=task_run,
            task_launcher=launcher,
            task_runner=task_runner,
            architect=architect,
            job=job,
        )
        task_run.update_completion_progress(status=False)

        db_id = task_run.db_id

        data = operator._task_runs_tracked[db_id]
        assignment = data.task_launcher.assignments[0]
        access_url = f"http://{data.task_launcher.launch_url}/?worker_id=x&assignment_id={assignment.db_id}"
        # MacOS
        chrome_path = 'open -a /Applications/Google\ Chrome.app %s'
        safari_path = 'open -a /Applications/Safari.app %s'
        if not DEPLOY:
            webbrowser.get(chrome_path).open(access_url)  # , new=2)

        operator.wait_for_runs_then_shutdown(
            skip_input=True, log_rate=cfg.monitoring_log_rate
        )

def clear_database():
    from pathlib import Path
    import shutil
    import os

    home = Path.home() / "Documents"
    print(f'Clearing mephisto data in {home}')

    mephisto_data_path = home / "mephisto" / "data"
    projects_path = mephisto_data_path / "data" / "runs" / "NO_PROJECT"
    mephisto_tmp_path = home / "mephisto" / "tmp"

    Path(mephisto_data_path / 'database.db').unlink(missing_ok=True)
    if os.path.isdir(projects_path):
        for dir in os.listdir(projects_path):
            if dir not in {'.DS_Store'}:
                shutil.rmtree(projects_path / dir, ignore_errors=True)
    if os.path.isdir(mephisto_tmp_path):
        for dir in os.listdir(mephisto_tmp_path):
            if dir not in {'.DS_Store'}:
                shutil.rmtree(mephisto_tmp_path / dir, ignore_errors=True)



DEPLOY = True
CLEAR = False

if __name__ == '__main__':
    # print(os.environ['PYTHONPATH'])
    if CLEAR:
        clear_database()
    terminal = Terminal()
    terminal.new_session()