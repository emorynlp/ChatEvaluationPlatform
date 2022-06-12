#!/usr/bin/env python3

# Copyright (c) Facebook, Inc. and its affiliates.
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import webbrowser

from mephisto.operations.operator import Operator

from omegaconf import DictConfig, OmegaConf

from parlai.crowdsourcing.utils.mturk import soft_block_mturk_workers
from behavior_analysis_blueprint import (
    SharedBehaviorAnalysisTaskState,
)


def new_task(cfg: DictConfig, db, world_module=None):
    """
    Run task, given configuration.
    """

    print(f'\nHydra config:\n{OmegaConf.to_yaml(cfg)}')

    # Update task name when on sandbox or local to ensure data is split.
    task_name = cfg.mephisto.task.get('task_name', 'behavior_analysis')
    architect_type = cfg.mephisto.architect._architect_type
    if architect_type == 'local':
        task_name = f"{task_name}_local"
    elif architect_type == 'mturk_sandbox':
        task_name = f"{task_name}_sandbox"
    cfg.mephisto.task.task_name = task_name

    soft_block_qual_name = cfg.mephisto.blueprint.get(
        'block_qualification', f'{task_name}_block'
    )
    # Default to a task-specific name to avoid soft-block collisions
    soft_block_mturk_workers(cfg=cfg, db=db, soft_block_qual_name=soft_block_qual_name)

    # Init
    shared_state = SharedBehaviorAnalysisTaskState(world_module=world_module)

    operator = Operator(db)
    db_id = operator.validate_and_run_config(run_config=cfg.mephisto, shared_state=shared_state)

    data = operator._task_runs_tracked[db_id]
    assignment = data.task_launcher.assignments[0]
    access_url = f"{data.task_launcher.launch_url}/?worker_id=x&assignment_id={assignment.db_id}"
    webbrowser.open(access_url)

    operator.wait_for_runs_then_shutdown(
        skip_input=True, log_rate=cfg.monitoring_log_rate
    )
