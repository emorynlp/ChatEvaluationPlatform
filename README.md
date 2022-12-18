-----

# Overview

**ChatEvaluationPlatform** is a [Parlai-crowdsourcing-based](https://github.com/facebookresearch/ParlAI/blob/main/parlai/crowdsourcing/README.md) framework for collecting dialogues and dialogue annotations for dialogue agents. It is a modular framework, where you can select specific subsets of annotations to collect. It provides built-in annotation setups for 40 labels, including pairwise comparisons, likert-style ratings, and dialogue-specific behaviors. More details of the built-in annotation setups and labels can be found in the paper: Don't Forget Your ABC's: Evaluating the State-of-the-Art in Chat-Oriented Dialogue Systems (link forthcoming).

Running an evaluation project using this platform causes a set of tasks to be generated for a specified setup. These tasks are accessed through a web browser. When running the platform locally, 
the links to the generated tasks look like: `localhost:3008/?worker_id=<WORKER_ID>&assignment_id=<ASSIGNMENT_ID>` where the choice of `<WORKER_ID>` denotes a unique human participant and the choice of `<ASSIGNMENT_ID>` denotes a unique assignment for the specified worker id. Upon a new connection using the appropriate link, the underlying tasks are given randomly to the connected participant. It is also possible to use **ChatEvaluationPlatform** to deploy tasks to crowdsourcing platforms like Amazon Mechanical Turk; we defer to the [Parlai/Mephisto crowdsourcing information](https://github.com/facebookresearch/ParlAI/blob/main/parlai/crowdsourcing/README.md) for further details.

-----

# Table of Contents
[1. Environment setup instructions](#setup)

[2. Running ChatEvaluationPlatform](#execution)

[3. Specifying Runtime Configuration](#hydra-configuration-files)

[4. Collecting Dialogues](#dialogue-collection-projects)

[5. Collecting Dialogue Annotations](#static-annotation-projects)

[6. Troubleshooting](#troubleshooting)

-----

# Setup

**ChatEvaluationPlatform** depends on a specific suite of external tools and packages. We provide a shell script that automatically creates a new [Anaconda](https://www.anaconda.com/) environment, and ensures all of the required dependencies are installed.

**ChatEvaluationPlatform** was developed using Python 3.8.

The shell script `setup.sh` checks and retrieves dependencies for running the dialogue evaluation platform. 

If it exits with instructions, follow the displayed instructions and then rerun `setup.sh` to proceed with the setup.

Once it exits without any displayed instructions, you are able to activate your new python environment with `conda activate dialogue_eval` which is configured to run the platform.

---

# Execution

The python script `welcome.py` is the main script for running the platform. It takes in a single command-line argument `conf` which is used to specify your desired tasks to run based on the specified configuration file. Configuration files are housed in `ChatEvaluationPlatform/collection_and_annotations/hydra_configs/conf/`.

To run the crowdsourcing application:

1. The `collection_and_annotations` directory contains the full crowdsourcing application. 

   To run it, `cd` into the directory and run the following command:

    ```
    python welcome.py conf=<conf_file_name>
    ```

    The `conf` argument specifies which `yaml` configuration file from `hydra_configs/conf/` to use.

    For example,

    ```
    python welcome.py conf=collect_dialogues
    ```
    
    will run the dialogue collection task.
    

**Note:** If you are running a dialogue collection task with dialogue agents that are not provided by Parlai directly, you must properly configure the PYTHONPATH.

You need to add the top-level `ChatEvaluationPlatform` directory and all directories of your agents in `parlai_internal` to PYTHONPATH. 

   An example is shown below that adds in one agent: `examplebot`

    export PYTHONPATH=/home/ChatEvaluationPlatform/parlai_internal/agents/examplebot:/home/ChatEvaluationPlatform/

--------

# Hydra Configuration Files

All projects that you will run under **ChatEvaluationPlatform** utilize hydra configuration `.yaml` files to specify the runtime parameters. 

To get familiar with the runtime parameters, refer to `behavior_analysis_blueprint.py` -- specifically, the classes `BaseBehaviorAnalysisBlueprintArgs` and `BehaviorAnalysisBlueprintArgs` provide descriptions of all of the runtime parameters. You can also refer to the examples for the built-in annotation types in the `hydra_configs/conf` directory.

Some important runtime parameters to keep in mind are those that discriminate between the dialogue collection task and the static annotation tasks.

To denote a dialogue collection task, make sure to set: 

    do_collect_dialogue: true
    do_external_annotations: false

To denote some static annotation tasks, make sure to set:

    do_collect_dialogue: false
    do_external_annotations: true

--------

# Dialogue Collection Projects

The dialogue collection task allows you to collect dialogues between dialogue models and human participants. There are two collection settings provided: single dialogue and paired dialogue.

For single dialogue, each completion of the task will result in a single dialogue from a human participant.

For paired dialogue, each completion of the task will result in two dialogues from a human participant.

To specify, in the `.yaml` file under `mephisto.blueprint`:

```
num_bots: 2 # <-- PAIRED DIALOGUE COLLECTION
conversations_needed_string: "bot1|bot2:20,bot1|bot3:20" # <-- PAIRED DIALOGUE COLLECTION
```
or
```
num_bots: 1 # <-- SINGLE DIALOGUE COLLECTION
conversations_needed_string: "bot1:20,bot2:20,bot3:20"   # <-- SINGLE DIALOGUE COLLECTION
```

where `botX` is a key from `collection_and_annotations/task_config/<your_dir>/model_opts.yaml` specifying a dialogue model and `:X` denotes the number of each to collect.

You can also specify if you want annotations to be collected within a dialogue collection task. There are two options: online and offline.

For online annotations, the annotations are collected as the conversation progresses. You can only specify 1 annotation-type for interactive annotations.

For offline annotations, the annotations are collected after the conclusion of the conversation. You can specify multiple annotation-types for offline annotations, and the participant will be guided through them in random order. For paired dialogue setting, you specify two lists, one for each dialogue. For single dialogue setting, you specify one list.

To specify, in the `.yaml` file under `mephisto.blueprint`:

```
do_interactive_online_annotations: "thumbsup" # <- ONLINE ANNOTATIONS 
do_interactive_offline_annotations: [["quality_likert","consistency_label"]] # <- OFFLINE ANNOTATIONS (SINGLE DIALOGUE)
do_interactive_offline_annotations: [["quality_likert","consistency_label"],["quality_likert","consistency_label"]] # <- OFFLINE ANNOTATIONS (PAIRED DIALOGUE)
```

An example `.yaml` file is provided at `collection_and_annotations/hydra_configs/conf/collect_dialogues.yaml`.

### Dialogue agent specification

* The `parlai_internal` directory contains models that are not built-in to Parlai. An example of a new dialogue agent is provided as `parlai_internal/examplebot`. 


* To specify built-in or new agents for your tasks:

1. If new agent, add your agent code to a new directory in `parlai_internal/agents` where `parlai_internal/agents/<your_model>/<your_model>.py` houses the class `<Your_model>Agent` that is Parlai compatible.


2. Add desired agent to the `collection_and_annotations/task_config/<your_dir>/model_opts.yaml`, following the `examplebot` example. All dialogue models you want to use (even those provided by Parlai) must be specified in `model_opts.yaml`.


3. Add desired agent to the `conversations_needed_string` argument in your desired `yaml` configuration file.

For more information about creating Parlai agents, please refer to Parlai. Some useful places to start include: [parlai agent class](https://parl.ai/docs/core/agents.html), [agent sharing](https://parl.ai/docs/tutorial_worlds.html#agent-sharing), and [simple parlai agent](https://parl.ai/docs/tutorial_quick.html#add-a-simple-model).

### New project

1. Create a `.yaml` file in `collection_and_annotations/hydra_configs/conf/`. An example `.yaml` file is provided at `collection_and_annotations/hydra_configs/conf/collect_dialogues.yaml`.

---

# Static Annotation Projects

Static annotation tasks allow you to collect annotations on static conversations (e.g. conversations that have already been collected). You specify the set of conversations with the desired annotation types.

There are two use cases supported by **ChatEvaluationPlatform**: using the built-in annotation types or specifying a new annotation type (e.g. custom question phrasing, custom answer options, etc.).

## Using Built-in Annotation Types

To use built-in annotation types applied to your specific dialogue data:

  1. Add the data to be annotated in a dedicated file in `task_config/task_data/<project_name>.jsonl`
    
      * Each line is json object specifying the datapoint:
        ```
        "dialogue_id": "<dialogue_id>",
        "group_id": "<unique identifier of datapoint>",
        "annotation_tasks": List of desired str annotation task names from task_config/annotation_buckets.json
        "turns": List of List[speaker str = "user" or "system", utterance str]
        "bot_persona": List of str persona sentences
        ```


  2. Specify the number of units you want for each datapoint in a `<project_name>_units.json` file, where the keys are the group ids of your datapoints and the value is an integer specifying the number of annotators (e.g. if you want 2 people to annotate a datapoint, you would specify the integer 2). Refer to the existing `<project_name>_units.json` for examples.


  3. Create hydra config yaml for your new project in `hydra_configs/conf/`
      * Update `mephisto.architect.port` to unique port (relative to other projects you plan to run at the same time)
      * Update `mephisto.blueprint.block_qualification` to `<project_name>_block`
      * Update `mephisto.blueprint.data_jsonl` to `${task_dir}/task_config/task_data/<project_name>.jsonl`


## Creating Custom Annotation Types

To setup a custom annotation type rather than using a built-in one,

  1. You must make a new directory `collection_and_annotations/task_config/<your_dir>` to house the creation of your new annotation type.


  2. Create `annotation_buckets.json` in `collection_and_annotations/task_config/<your_dir>/`. This is where you will specify your new annotation type.


  3. Specify your new annotation type of `<task_name>` as a new key:value entry in `annotation_buckets.json` from Step 2. For more details see `Annotation Schemes` section below and refer to `task_config/annotation_buckets.json` for examples of the built-in annotation types.


  4. Add entry to task description file `frontend/components/task_descriptions.jsx` where case is the `task_name`


  5. Once your new annotation type is created, you use it like the built-in annotation types (e.g. `Using Built-in Annotation Tasks` above).
     

  6. If you want to create training for your task, see section `Constructing Training` below. Also, uppdate hydra config yaml with:

    use_screening_task: True
    passed_qualification_name: <task_name>_screen
    max_screening_units: <max_number_of_participants>
    screen_json: ${task_dir}/task_config/onboarding_data/<task_name>.json


  7. If you do not implement training for your task, then remove the 4 configuration elements in Step 6 from the hydra config.


### Specifying Annotation Types

Annotation schemes are specified in `collection_and_annotations/task_config/<your_dir>/annotation_buckets.json`. 

Each key is the task name and the value is the dictionary configuration of that task.

```
  "<task_name>": {
        "task_title": "<task_name>",
        "question": "<question_text>",
        "indices": "[no_indices|odd|even|all|all_skip_first]",
        "config": "[comparative|likert-5-dialogue|multiselect|button_flow|nondetails_button_flow|nondetails_nonhelp_button_flow]",
        "options": list of flat options or dictionary of questions,
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
  * `button_flow`: For each turn, answer a series of questions (questions are collapsed by default and each question is matched a help section in the instructions); `options` Dictionary 
  * `nondetails_button_flow`: Same as `button_flow`, except questions are not in a collapsed box by default
  * `nondetails_nonhelp_button_flow`: Same as `nondetail_button_flow`, except there is no help link for each question


`options`: Specifies the questions and answers for the task
  * For Dict options, it specifies branches of questions and answers
      ```
      {
        question: {
          answer: {},
          answer: {}
        },
        question: {
          answer: {},
          answer: {},
          answer: {},
          answer: {}
        }
      }
      ``` 
    
`require`: Specifies when the task is considered to be complete; used to toggle enabling the submit button for tasks where every datapoint must have a label
  * `level`
    * `dialogue`: The annotations were performed on the dialogue level and all questions must be answered
    * `turn`: The annotations were performed on the turn level and all questions each turn must be answered


### Constructing Training

**ChatEvaluationPlatform** supports screening the human participants for static annotation projects using specified training dialogues. These training dialogues contain ground-truth answers for their corresponding annotation type, which are used to both provide feedback to the human participant throughout the training and to measure the performance of each human participant on the annotation task. Only those human participants that perform well at the end of the training process are allowed to work on real assignments for that annotation task.

The training dialogues are specified in `<task_name>.json` files in `task_config/onboarding_data/`. The keys denote each training dialogue, with the values specifying the dialogue content and ground-truth answers. For each turn in the dialogue that requires annotations, the ground-truth answers must be specified for training to work.

Specifying the ground-truth answers for a particular turn is as follows:

      [
        "system",  <- speaker str
        "i don't think they are real either, but i do believe in them. do you have any hobbies?",  <- utterance str
        {"commonsense_q": "This response contradicts common knowledge."},  <- ground-truth answer
        "Believing in something generally has the same implications as thinking it is real. The response is therefore illogical and self-contradictory."  <- explanation for ground-truth answer
      ]

The format of the ground-truth answer depends on the underlying task configuration. Refer to the existing training files for example formats for various task configurations.

When screening is enabled, the first link for a particular annotation type that a participant opens will be the screening round of training dialogues. If they pass, all subsequent links for that annotation type that they open will be real conversations to be annotated. If they fail, all subsequent links for that annotation type that they open will inform them that they are ineligible to complete any assignments  for that particular annotation type.

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
