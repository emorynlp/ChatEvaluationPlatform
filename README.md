-----

# Setup

`setup.sh` checks and retrieves dependencies for running the dialogue evaluation platform. 

If it exits with instructions, follow the displayed instructions and then rerun `setup.sh` to proceed with the setup.

---

# Execution

To run the crowdsourcing application:

1. You need to add the top-level `behavior_analysis_interface` directory and all directories of your agents in `parlai_internal` to PYTHONPATH. 

   An example is shown below that adds in two agents: `cem` and `dukenet`
   
    ```
    export PYTHONPATH=/home/behavior_analysis_interface/parlai_internal/agents/examplebot:/home/behavior_analysis_interface/
    ```

2. The `collection_and_annotations` directory contains the full crowdsourcing application. 

   To run it, `cd` into the directory and run the following command:

    ```
    python welcome.py conf=collect_dialogues
    ```

    The `conf` argument specifies which `yaml` configuration file from `hydra_configs/conf` to use.

---------

# Troubleshooting

```
...
opensslErrorStack: [ 'error:03000086:digital envelope routines::initialization error' ],
library: 'digital envelope routines',
reason: 'unsupported',
code: 'ERR_OSSL_EVP_UNSUPPORTED'
```

**Solution:** In the terminal where you are running the platform from, execute `use nvm 12`.

--------

# Adding custom features

1. You must make a new directory in `collection_and_annotations/task_config/<your_dir>` to house your new features.

## Annotation Labelling Schemes

Annotation labelling schemes are specified in `collection_and_annotations/task_config/<your_dir>/annotation_buckets.json`. 

Each key is the task name and the value is the dictionary configuration of that task.

```
  "<task_name>": {
    "task_title": "<task_name>",
    "question": "<question_text>",
    "indices": "[no_indices|odd|even|all|all_skip_first]",
    "config": "[comparative|likert-5-dialogue|multiselect|button_flow|nondetails_button_flow|nondetails_nonhelp_button_flow]",
    "options": list of flat options or dictionary of hierarchical questions,
    "require": {"level": "[dialogue|turn]"} *optional
  }
```

`task_title`: Same as key

`question`: The question text to be displayed

`indices`: Name of the index function to use when generating what needs to be annotated
  * `no_indices`: Used for dialogue-level annotations, since no turns are annotated
  * `odd`: odd turns are annotated
  * `even`: even turns are annotated
  * `all`: all turns are annotated
  * `all_skip_first`: all turns except for the first turn are annotated

`config`: The name of the display configuration to use
  * `comparative`: Display two dialogues side-by-side and answer a question about them; `options` List<string options>
  * `likert-5-dialogue`: Display one dialogue and answer a question on a 5-point Likert scale; `options` List<dict of `label`: str and `question`: str> 
  * `multiselect`: For each turn, dropdown menu of answers; `options` List<dict of `value`: str and `label`: str>
  * `button_flow`: For each turn, answer a series of questions, where questions are dynamically displayed depending on previous answers; `options` Dictionary 
  * `nondetails_button_flow`: Same as `button_flow`, except questions are not in a collapsed box by default
  * `nondetails_nonhelp_button_flow`: Same as `nondetail_button_flow`, except there is no help link for each question


`options`: Specifies the questions and answers for the task
  * For Dict options, it specifies branches of questions and answers
      ```
      {
        question: {
          answer: {
            question: {
              answer: {},
              answer: {}
            },
          answer: {}
          }   
        }
      }
      ``` 
    
`require`: Specifies when the task is considered to be complete; used to toggle enabling the submit button for tasks where every datapoint must have a label
  * `level`
    * `dialogue`: The annotations were performed on the dialogue level and all questions must be answered
    * `turn`: The annotations were performed on the turn level and all questions each turn must be answered
  * `labels`: Specifies what sets of questions+answers are considered to be complete
    *  todo

## Dialogue Collection Projects

### New dialogue agent

* The `parlai_internal` directory contains models that are not built-in to Parlai. An example of a new dialogue agent is provided as `parlai_internal/examplebot`. 

* To add more new dialogue agents:

1. Add your agent code to a new directory in `parlai_internal/agents` where `parlai_internal/agents/<your_model>/<your_model>.py` houses the class `<Your_model>Agent` that is Parlai compatible.


2. Add your agent to the `collection_and_annotations/task_config/<your_dir>/model_opts.yaml`, following the `examplebot` example.


3. Add your agent to the `conversations_needed_string` argument in your desired `yaml` configuration file. See `collection_and_annotations/hydra_configs/conf/collect_dialogues.yaml` for format example.

### New project

1. Create a `.yaml` file in `collection_and_annotations/hydra_configs/conf/`.

## Static Annotation Projects

## New static annotation task

To add a new task,

  1. Add an entry into the task configuration file: `collection_and_annotations/task_config/<your_dir>/annotation_buckets.json`. For more details see `New task configuration` section below.
  

  2. Create the training files:

        * Create spreadsheet in `DialogueBehaviorAnalysis/onboarding/` Google Drive.
        * Download and put spreadsheet in `task_config/onboarding_data`
        * Update and run `task_config/parse_onboarding_data.py`
          * todo - details


  3. Add the data to be annotated in a dedicated file in `task_config/task_data`
    
      * Each line is json object specifying the datapoint:
        ```
        "dialogue_id": "<dialogue_id>",
        "annotation_tasks": List of str of task names
        "turns": List of Lists [speaker str = "user" or "system"), utterance str]
        "bot_persona": List of str persona sentences
        ```
  

  4. Add hydra config yaml for new task in `hydra_configs/conf/`
      * Update `mephisto.architect.port` to empty port (unused in rest of yaml files)
      * Update `mephisto.blueprint.block_qualification` to `behavior_<task_name>_block`
      * Update `mephisto.blueprint.onboarding_qualification` to `behavior_<task_name>_onboarding`
      * Update `mephisto.blueprint.onboard_task_data_path` to `${task_dir}/task_config/onboarding_data/behavior_<task_name>.json`
      * Update `mephisto.blueprint.data_jsonl` to `${task_dir}/task_config/task_data/behavior_<task_name>.jsonl`


  5. Add entry to task description file `frontend/components/task_descriptions.jsx` where case is the `task_name`
  
