/*
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from "react";
import { getTaskDescription, compileTaskDescription } from './task_descriptions.jsx'
import {index_functions} from "./tasks/annotation_indices_functions.jsx";
import {compare_answers, waitScroll, addEndTime, addStartTime, getTaskTimeKey, compare_all_answers} from "./utils.jsx";
import {AnnotationView, ContentPane, SideBySideContentPane, SideBySideRightTopPane} from "./annotation_panes.jsx";
import {SubtaskSubmitButton} from "./submit_button.jsx";
import {DialogueSingleSelect} from "./dialogue_single_select.jsx";
import {OnboardingFeedback} from "./onboarding_feedback.jsx";
import {OnboardingWelcome, OnboardingInit, FeedbackInit, OnboardingFin, renameTaskTitle} from "./onboarding_bookends.jsx";
import {ComparativeMC} from "./comparative_multiple_choice.jsx";
import {LikertScale} from "./likert_scale.jsx";
import {SubmitTaskPage} from "./submit_task.jsx";


function AnnotationComponent({ taskData, prevData, mephistoProps, isScreen, annotations, setAnnotations, index, setIndex, annot, setAnnot, setSubmitted, submitted, modelIdx, setModelIdx, setChatDone, interactive }) {
  // taskData Object(dialogue_id: Object("turns": [], "bot_persona": [], "annotation_tasks": [] (optional) ))

  let {
    taskConfig,
    handleSubmit,
    isOnboarding,
    isPreview,
    destroy
  } = mephistoProps;

  if (taskData === undefined) {
    return <div><p> Loading chats...</p></div>;
  }

  const dialogue_ids = Object.keys(taskData);
  const num_dialogues = dialogue_ids.length;
  const dialogue_id = dialogue_ids[index]; // used to index into taskData
  let subtaskData = taskData[dialogue_id];

  // for onboarding session
  const [incorrectTurns, setIncorrectTurns] = React.useState([[],-1,0]); //[list of incorrect turns, incorrect turn idx (-1 for not initialized yet), correct percentage]
  const [mistakes, updateMistakes] = React.useReducer(
      (state, new_mistakes) => {return state.concat([new_mistakes])},
      []
  )

  const [startupPage, setStartupPage] = React.useState("task"); // records whether initial startup page has been displayed for training
  const [startupPageNum, setStartupPageNum] = React.useState(1);
  const [loadPrev, setLoadPrev] = React.useState(true);

  let annotationQuestions = [];

  if (subtaskData !== undefined && "annotation_tasks" in subtaskData){ // takes priority over do_interactive_offline_annotations specification
      annotationQuestions.push(...subtaskData["annotation_tasks"].map(task => taskConfig.annotation_buckets.config[task]));
  }

  let task_title = null;
  let indices_to_annotate = [null];
  let currentAnnotationQ = null;
  if (annotationQuestions !== null) {
    currentAnnotationQ = annotationQuestions[annot];
    if (subtaskData !== undefined) {
      task_title = currentAnnotationQ.task_title;
      indices_to_annotate = index_functions.get(currentAnnotationQ.indices)(subtaskData.turns);
      if (loadPrev) {
          setLoadPrev(false);
          let annotationStart, indexStart, annotStart;
          let loaded = false;
          if (prevData !== undefined && prevData !== null && prevData.messages.length > 0) {
                let prev_data = isOnboarding ? prevData.messages.at(-1).data?.onboarding_data : prevData.messages.at(-1).data?.task_data?.final_data;
                if (prev_data === undefined) {
                    // means the last message was NOT a final submission message which is formatted differently
                    prev_data = prevData.messages.at(-1).data;
                }
                if (prev_data.hasOwnProperty("lastIndex")) { // chatApp sends messages other than annotations, so need to distinguish
                    annotationStart = prev_data;
                    indexStart = prev_data.lastIndex;
                    annotStart = prev_data.lastAnnot;
                    setIndex(indexStart);
                    setAnnot(annotStart);
                    if (prev_data.hasOwnProperty("lastIncorrectTurns")) {
                        setIncorrectTurns(prev_data.lastIncorrectTurns);
                        prev_data.mistakes.map((ms) => updateMistakes(ms));
                        setStartupPage(prev_data.lastStartupPage);
                        setStartupPageNum(prev_data.lastStartupPageNum);
                    }
                    // set start time of current task
                    const time_label = getTaskTimeKey(isOnboarding, indexStart, annotStart);
                    setAnnotations({...annotationStart, [time_label]: addStartTime(annotationStart, time_label, Date.now())});

                    loaded = true;
                }
          }
          if (!loaded) {
              // set start time of current task
              const time_label = getTaskTimeKey(isOnboarding, index, annot);
              setAnnotations({...annotations, [time_label]: addStartTime(annotations, time_label, Date.now())});
          }
      }
    }
  }

  const [lastAnnotatedTurn, setLastAnnotated] = React.useState(indices_to_annotate[0]);

  const [adjustScroll, setDoAdjustScroll] = React.useState(null);

  if (adjustScroll !== null){
    const lastMessage = document.getElementById(`chat_message_${index}_${lastAnnotatedTurn}`);
    const rightTopPane = document.getElementById(`right-top-pane`);
    waitScroll(lastMessage, rightTopPane, adjustScroll)
    setDoAdjustScroll(null);
  }

  let submitBtn;
  if (isOnboarding){

    let skip_feedback = false;

    // if completed final training round but did not pass, skip straight to end rather than giving feedback
    if (incorrectTurns[0].length > 0 && incorrectTurns[1] < incorrectTurns[0].length && startupPage==="feedback" && subtaskData.remaining === 0) {
        let thresh = subtaskData.pass_criteria;
        let attempt3_mistakes = mistakes[2].length;
        let passed = attempt3_mistakes <= thresh;
        if (!passed) {
            skip_feedback = true;
            setIncorrectTurns([incorrectTurns[0], incorrectTurns[0].length, incorrectTurns[2]]);
        }
    }

    if (incorrectTurns[0].length > 0 && incorrectTurns[1] < incorrectTurns[0].length && !skip_feedback){
      // feedback sequence
      if (startupPage==="feedback"){
          return <FeedbackInit taskTitle={currentAnnotationQ.task_title}
                   numMistakes={incorrectTurns[0].length} passCriteria={subtaskData.pass_criteria}
                   setStartupPage={setStartupPage}/>;
      }
        return (
          <div style={{ margin:0, padding:0, height:'100%' }}>
            <OnboardingFeedback
              subtaskData={subtaskData}
              mephistoProps={mephistoProps}
              num_dialogues={num_dialogues}
              currentAnnotationQ={currentAnnotationQ}
              index={index}
              annot={annot}
              startupPage={startupPage}
              startupPageNum={startupPageNum}
              annotations={annotations}
              setAnnotations={setAnnotations}
              incorrectTurns={incorrectTurns}
              setIncorrectTurns={setIncorrectTurns}
              mistakes={mistakes}
            />
          </div>
        );
    }
    else if (incorrectTurns[1] >= incorrectTurns[0].length || skip_feedback) {
        // all feedback for previous task completed
        if (startupPage!==false) { setStartupPage(false); }
        const nindex = index + 1;
        const trainingCompleted = nindex >= num_dialogues;
        let progressMessage, title;
        let passed;
        const taskTitle = renameTaskTitle(currentAnnotationQ.task_title);
        if (!trainingCompleted){
            if (subtaskData.remaining === 2) {
                title = 'Good work!';
                progressMessage = (<span>
                    {incorrectTurns[1] === 0 ? (
                        <span>
                            You got a perfect score on the last conversation!
                            <br/><br/>
                        </span>
                    ) : ''}
                    Since you're just starting out, we have a couple more conversations for you to work on in this training task.
                    <br/><br/>
                    Once you pass the training, each task will involve labeling just a single conversation (without feedback). The conversation you just labeled is an example of what you can expect to do in each task.
                    </span>)
            }
            else if (subtaskData.remaining === 1) {
                title = 'Test Round!';
                progressMessage = (<span>
                    {incorrectTurns[1] === 0 ? (
                        <span>
                            You got a perfect score on the last conversation!
                            <br/><br/>
                        </span>
                    ) : ''}
                    The next conversation is graded, and determines whether you can continue.
                    <br/><br/>
                    Good luck!
                    </span>)
            }
        } else {
            // Determine if training was passed
            let thresh = subtaskData.pass_criteria;
            let attempt3_mistakes = mistakes[2].length;
            passed = attempt3_mistakes <= thresh;
            if (!passed) {
                title = 'Better luck next time...';
                progressMessage = (<span>
                    Unfortunately you did not meet the labeling accuracy threshold needed to pass the training.
                    <br/><br/>
                    However, please consider trying out the other <b>Emory Chatbot Evaluation</b> projects.
                    <br/><br/>
                    We have 10 other projects similar to this one coming soon, and many people find certain projects more intuitive than others.
                    <br/><br/>
                    Thank you for your participation!
                    </span>)
            } else {
                title = 'Congratulations!';
                progressMessage = (<span>
                    <b>You passed the training</b>, and can continue on to labeling real conversations (1 conversation per assignment).
                    <br/><br/>
                    Please be aware that, to ensure quality data, we have put hidden test conversations among the tasks you will work on.
                    <br/><br/>
                    <b>Failing hidden test conversations will disallow you from working on future tasks on this project</b>, so please keep up the fantastic work you have put in for this training!
                    </span>)
            }
       }

        return <OnboardingFin title={title}
                              progressMessage={progressMessage}
                              onClick={() => {
                                    let updatedAnnotations = {...annotations, "lastIndex": nindex, "lastAnnot": 0};
                                    setIndex(nindex);
                                    setAnnot(0); // todo - onboarding only supports one annotation task per dialogue currently
                                    const ntaskData = taskData[dialogue_ids[nindex]];
                                    let sp = startupPage;
                                    let spn = startupPageNum;
                                    const it = [[],-1,0];
                                    if (trainingCompleted){
                                        sp = false;
                                        spn = startupPageNum + 1;
                                        handleSubmit({'annotations': JSON.stringify(updatedAnnotations), 'mistakes': mistakes, 'success': passed, 'completed': true });
                                    }
                                    else{
                                        const ntime_label = getTaskTimeKey(isOnboarding, nindex, 0);
                                        const ntimes  = addStartTime(annotations, ntime_label, Date.now());
                                        updatedAnnotations = {...updatedAnnotations, [ntime_label]: ntimes}
                                        newTaskLastAnnotated(ntaskData, 0, taskConfig, setLastAnnotated);
                                    }
                                    setAnnotations(updatedAnnotations);
                                    setStartupPage(sp);
                                    setStartupPageNum(spn);
                                    setIncorrectTurns(it); // init incorrectTurns for next training task
                              }}
                              />
    }
    else if (incorrectTurns[1] === -1) {
        if (startupPage==="start"){
            // welcome to training page
            return <OnboardingWelcome setStartupPage={setStartupPage} />;
        }
        else if (startupPage==="task"){
            // training startup page for next task where startupPage is a number indicating what task # we are on
            return <OnboardingInit taskTitle={currentAnnotationQ.task_title}
                                   startupPageNum={startupPageNum}
                                   setStartupPage={setStartupPage}/>;
        }
    }

    if (index < num_dialogues) {
        submitBtn = <SubtaskSubmitButton subtaskIndex={index} numSubtasks={num_dialogues} indices_to_annotate={indices_to_annotate}
                                         annotIndex={annot} numAnnots={annotationQuestions.length}
                                         annotationQ={currentAnnotationQ} annotations={annotations} taskConfig={taskConfig}
                                         isPreview={isPreview}
                                         onSubtaskSubmit={() => {
                                             handleSubtaskSubmit(mephistoProps, index, setIndex, num_dialogues,
                                                 annot, setAnnot, dialogue_ids, taskData, annotations, setAnnotations,
                                                 setLastAnnotated, currentAnnotationQ, annotationQuestions, modelIdx,
                                                 setIncorrectTurns, mistakes, updateMistakes, setStartupPage, startupPageNum);
                                         }}/>
    }

  }
  else {
      if (index < num_dialogues) {
          submitBtn = <SubtaskSubmitButton subtaskIndex={index} numSubtasks={num_dialogues} indices_to_annotate={indices_to_annotate}
                                           annotIndex={annot} numAnnots={annotationQuestions.length}
                                           annotationQ={currentAnnotationQ} annotations={annotations} taskConfig={taskConfig}
                                           isPreview={isPreview}
                                           onSubtaskSubmit={() => { handleSubtaskSubmit(mephistoProps, index, setIndex, num_dialogues,
                                               annot, setAnnot, dialogue_ids, taskData, annotations, setAnnotations, setLastAnnotated,
                                               currentAnnotationQ, annotationQuestions, modelIdx); }}/>
      }
  }

  if (index >= num_dialogues) { // Assignment completed!
      if (taskConfig.do_collect_dialogue && modelIdx < taskConfig.num_bots) { // more chatting to be done
          if (annotations[modelIdx] !== undefined) {
              setModelIdx(modelIdx + 1);
          }
          // setChatDone(false);
          // console.log('more chatting to be done');
          return (
              <div style={{margin: 0, padding: 0, height: '100%', textAlign: 'center'}}>
                  <h2>Initializing next conversation...</h2>
              </div>
          );
      }
      else {
          if (isOnboarding && !isScreen) { // only for true onboardings (and not screenings that are being treated like onboarding)
              return (
                  <div style={{margin: 0, padding: 0, height: '100%', textAlign: 'center'}}>
                      <h2>Training finished! </h2>
                      <br/>
                      <p className="onboarding-description">
                          Training results are being processed. If you passed, you will begin the first assignment of
                          this annotation task.
                          If you did not pass, you will need to choose a different annotation task to work on from the
                          email.
                      </p>
                  </div>
              );
          }
          // else if (isScreen){
          //     return <SubmitTaskPage setSubmitted={setSubmitted} submitted={2} handleSubmit={handleSubmit} state={mephistoProps.agentState} annotations={annotations} destroy={destroy} />;
          // }
          return <SubmitTaskPage setSubmitted={setSubmitted} submitted={submitted} handleSubmit={handleSubmit} state={mephistoProps.agentState} annotations={annotations} destroy={destroy} />;
      }
  }

  const task_description = compileTaskDescription(subtaskData, task_title, taskConfig);
  const is_task_ongoing = index + 1 <= num_dialogues;
  const progress_msg = `You are on task ${annot + 1} / ${annotationQuestions.length} for dialogue ${index + 1} / ${taskConfig.do_collect_dialogue ? taskConfig.num_bots : num_dialogues}`;

  let full_dialogue_annotation = '';
  let contentHeight = '80%';
  let tabHeight = '20%';
  let speakerLabel, otherLabel;
  if (taskConfig.do_collect_dialogue){
    speakerLabel = 'your partner';
    otherLabel = 'you';
  } else {
    speakerLabel = 'Alex';
    otherLabel = 'Sam';
  }
  if (currentAnnotationQ.config === 'foreach-5-select-dialogue') {
      full_dialogue_annotation = <DialogueSingleSelect annotationQ={currentAnnotationQ} subtaskIdx={index}
                                                       onUserInputUpdate={() => null} annotations={annotations}
                                                       setAnnotations={setAnnotations}/>;
      contentHeight = '60%';
      tabHeight = '40%';
  }
  else if (currentAnnotationQ.config === 'comparative'){
      full_dialogue_annotation = <ComparativeMC annotationQ={currentAnnotationQ} subtaskIdx={index}
                                                annotations={annotations} setAnnotations={setAnnotations}
                                                speakerLabel={speakerLabel} otherLabel={otherLabel}/>
      contentHeight = '60%';
      tabHeight = '40%';
  }
  else if (currentAnnotationQ.config === 'likert-5-dialogue') {
      full_dialogue_annotation = <LikertScale annotationQ={currentAnnotationQ} subtaskIdx={index}
                                              annotations={annotations} setAnnotations={setAnnotations}
                                              speakerLabel={speakerLabel} otherLabel={otherLabel}/>
      contentHeight = '60%';
      tabHeight = '40%';
  }

  let contentPn;
  let sideBySide;
  if (currentAnnotationQ.config === 'comparative') {
      if (mephistoProps.taskConfig.do_collect_dialogue) {
          const prev_id = dialogue_ids[index - 1];
          const prev_data = taskData[prev_id];
          contentPn = <SideBySideRightTopPane datas={[prev_data, subtaskData]} annotationQ={currentAnnotationQ}
                                              subtaskIndex={index}
                                              annotations={annotations} setAnnotations={setAnnotations}
                                              lastAnnotatedTurn={lastAnnotatedTurn} setLastAnnotated={setLastAnnotated}
                                              indices_to_annotate={indices_to_annotate}
                                              setDoAdjustScroll={setDoAdjustScroll}
                                              interactive={interactive} contentHeight={contentHeight}/>;
      }
      else if (mephistoProps.taskConfig.do_external_annotations) {
          const dialogue_ids = subtaskData.dialogue_id.split("|");
          const left = {dialogue_id: dialogue_ids[0], turns: subtaskData.turns};
          const right = {dialogue_id: dialogue_ids[1], turns: subtaskData.turns2};
          contentPn = <SideBySideRightTopPane datas={[left, right]} annotationQ={currentAnnotationQ}
                                              subtaskIndex={index}
                                              annotations={annotations} setAnnotations={setAnnotations}
                                              lastAnnotatedTurn={lastAnnotatedTurn} setLastAnnotated={setLastAnnotated}
                                              indices_to_annotate={indices_to_annotate}
                                              setDoAdjustScroll={setDoAdjustScroll}
                                              interactive={interactive} contentHeight={contentHeight}/>;
      }
      else {
          console.log('CURRENT COMPARATIVE SETUP IS NOT SUPPORTED!')
          console.log(mephistoProps);
      }
      sideBySide = true;
  } else {
        contentPn = <ContentPane subtaskData={subtaskData} annotationQ={currentAnnotationQ}
                                 subtaskIndex={index}
                                 annotations={annotations} setAnnotations={setAnnotations}
                                 lastAnnotatedTurn={lastAnnotatedTurn} setLastAnnotated={setLastAnnotated}
                                 indices_to_annotate={indices_to_annotate} setDoAdjustScroll={setDoAdjustScroll}
                                 interactive={interactive} contentHeight={contentHeight}/>;
  }


  return <AnnotationView is_task_ongoing={is_task_ongoing} task_description={task_description}
                         currentAnnotationQ={currentAnnotationQ} progress_msg={progress_msg}
                         full_dialogue_annotation={full_dialogue_annotation} contentHeight={contentHeight} tabHeight={tabHeight}
                         contentPn={contentPn} sideBySide={sideBySide} submitBtn={submitBtn} />;
}



var handleSubtaskSubmit = function (mephistoProps, subtaskIndex, setIndex, numSubtasks, annot, setAnnot, dialogue_ids, taskData,
                                    annotations, setAnnotations, setLastAnnotated, annotationQ, annotationQuestions, modelIdx,
                                    setIncorrectTurns, mistakes, updateMistakes, setStartupPage, startupPageNum) {

    const {
        taskConfig,
        handleSubmit,
        isOnboarding,
        sendMessage,
        destroy
    } = mephistoProps;

    // if (isOnboarding) {
    //     let confirmSubmit = confirm("Are you sure you want to submit your answers?");
    //     if (!confirmSubmit) {
    //         return;
    //     }
    // }

    // initialTaskData is the initial task data for this index
    const numAnnot = annotationQuestions.length;
    const time_label = getTaskTimeKey(isOnboarding, subtaskIndex, annot);
    const times = addEndTime(annotations, time_label, Date.now())
    let updatedAnnotations = {...annotations, [time_label]: times};
    setAnnotations(updatedAnnotations);

    document.getElementById('left-pane').scrollTo(0, 0);
    const rtp = document.getElementById('right-top-pane');
    if (rtp) {
        rtp.scrollTo(0, 0);
    }
    else {
        const rtpl = document.getElementById('right-top-pane-l');
        const rtpr = document.getElementById('right-top-pane-r');
        rtpl.scrollTo(0, 0);
        rtpr.scrollTo(0, 0);
    }
    document.getElementById('right-bottom-pane').scrollTo(0, 0);

    let nannot = 0;
    let nindex = subtaskIndex;

    const is_gold = dialogue_ids[subtaskIndex].includes('_gold_');

    if (isOnboarding){ //check answers
        const annotated = annotations[subtaskIndex]?.data;
        const dialogue_data = taskData[dialogue_ids[subtaskIndex]];
        const true_turn_data = dialogue_data.turns;
        let correct = 0;
        let incorrect = 0;
        let total = 0;
        let incorrect_idxs = [];
        // todo LIMITATION: onboarding must have one unique dialogue per task, otherwise answer checking does not work (cannot identify no selections properly)
        for (let turn_idx = 0; turn_idx < true_turn_data.length; turn_idx++) {
            const true_turn = true_turn_data[turn_idx];
            const [ucorrect, uincorrect, utotal, uincorrect_idxs] = compare_all_answers(turn_idx, annotated, true_turn);
            correct += ucorrect;
            incorrect += uincorrect;
            total += utotal;
            incorrect_idxs.push(...uincorrect_idxs);
        }

        // console.log(`${correct} (P) + ${incorrect} (F) = ${total} T`)
        const it = [incorrect_idxs, 0, correct / total];
        const sp = "feedback";
        setIncorrectTurns(it);
        updateMistakes(it[0])
        setStartupPage(sp);

        sendMessage({...updatedAnnotations, "lastIndex": subtaskIndex, "lastAnnot": annot,
            "lastIncorrectTurns": it, "mistakes": mistakes.concat([it[0]]), "lastStartupPage": sp, "lastStartupPageNum": startupPageNum});
    }
    else {
        if (annot === (numAnnot - 1)) { // proceed to next conversation
            nindex = subtaskIndex + 1;
        } else { // proceed to next annotation question
            nannot = annot + 1;
        }
        setAnnot(nannot);
        setIndex(nindex);

        if (subtaskIndex >= (numSubtasks - 1) && annot >= (numAnnot - 1)) { // All annotations for all conversations completed
            if (is_gold) {
                const dialogue_data = taskData[dialogue_ids[subtaskIndex]];
                const true_turn_data = dialogue_data.turns;
                let incorrect = 0;
                for (let turn_idx = 0; turn_idx < true_turn_data.length; turn_idx++) {
                    const true_turn = true_turn_data[turn_idx];
                    const [ucorrect, uincorrect, utotal, uincorrect_idxs] = compare_all_answers(turn_idx, updatedAnnotations[subtaskIndex]?.data, true_turn);
                    incorrect += uincorrect;
                }
                handleSubmit({'annotations': JSON.stringify(updatedAnnotations), "lastIndex": nindex, "lastAnnot": nannot, "completed": true, "gold_mistakes": incorrect});
                destroy();
            }
            else {
                if (taskConfig.do_collect_dialogue && modelIdx < taskConfig.num_bots - 1){ // more chatting to be done
                    sendMessage({...updatedAnnotations, "lastIndex": nindex, "lastAnnot": nannot, "completed": true});
                } else {
                    handleSubmit({'annotations': JSON.stringify(updatedAnnotations), "lastIndex": nindex, "lastAnnot": nannot, "completed": true});
                    destroy();
                }
            }
        }
        else { // initialize lastAnnotatedTurn for next annotation task
            sendMessage({...updatedAnnotations, "lastIndex": nindex, "lastAnnot": nannot});
            const ntaskData = taskData[dialogue_ids[nindex]];
            newTaskLastAnnotated(ntaskData, nannot, taskConfig, setLastAnnotated);

            const ntime_label = getTaskTimeKey(isOnboarding, nindex, nannot);
            setAnnotations({...updatedAnnotations, "lastIndex": nindex, "lastAnnot": nannot,
                                [ntime_label]: addStartTime(annotations, ntime_label, Date.now())});
        }
    }
}

function newTaskLastAnnotated(ntaskData, nannot, taskConfig, setLastAnnotated) {
    let nannotationQuestions = [];

    if (ntaskData !== undefined && "annotation_tasks" in ntaskData){ // takes priority over do_interactive_offline_annotations specification
        nannotationQuestions.push(...ntaskData["annotation_tasks"].map(task => taskConfig.annotation_buckets.config[task]));
    }

    const indices_to_annotate = index_functions.get(nannotationQuestions[nannot].indices)(ntaskData.turns);
    setLastAnnotated(indices_to_annotate[0]);
    return nannotationQuestions[nannot].task_title;
}


export { AnnotationComponent };
