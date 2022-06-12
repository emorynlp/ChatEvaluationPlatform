import React from "react";
import { getTaskDescription, compileTaskDescription } from './task_descriptions.jsx'
import {AnnotationView, ContentPane} from "./annotation_panes.jsx";
import {SubtaskSubmitButton} from "./submit_button.jsx";
import {DialogueSingleSelect} from "./dialogue_single_select.jsx";
import {addEndTime, compare_all_answers, compare_answers, getTaskTimeKey, selectCorrectAnswerToShow} from "./utils.jsx";


export function OnboardingFeedback({ subtaskData, mephistoProps, num_dialogues, currentAnnotationQ, index, annot, startupPage, startupPageNum, annotations, setAnnotations, incorrectTurns, setIncorrectTurns, mistakes }) {

    // set up data
    const feedback_idx = incorrectTurns[0][incorrectTurns[1]];
    const [feedbackAnnot, setFeedbackAnnot] = React.useState(annotations);
    const [isSwitch, setSwitch] = React.useState(true)

    const task_description = compileTaskDescription(subtaskData, currentAnnotationQ.task_title, mephistoProps.taskConfig);
    const is_task_ongoing = true;
    const progress_msg = `You are on feedback ${incorrectTurns[1] + 1} out of ${incorrectTurns[0].length}`;
    const full_dialogue_annotation = ''; // todo LIMITATION - onboarding feedback supported for turn-based annotations only
    const contentPn = <ContentPane subtaskData={subtaskData} annotationQ={currentAnnotationQ}
                                   subtaskIndex={index} annotations={feedbackAnnot} setAnnotations={setFeedbackAnnot}
                                   indices_to_annotate={[feedback_idx]} lastAnnotatedTurn={feedback_idx}
                                   turnSpecs={ {[feedback_idx]: 'alert alert-danger'} } feedbackMode={true}/>
    const submitBtn = <SubtaskSubmitButton subtaskIndex={incorrectTurns[1]} numSubtasks={incorrectTurns[0].length}
                                 annotIndex={0} numAnnots={1} check_completion={false}
                                 onSubtaskSubmit={() => { handleFeedbackSubmit(feedbackAnnot.hasOwnProperty(index) && feedbackAnnot[index].hasOwnProperty("data") ? feedbackAnnot[index]["data"] : {},
                                                                        subtaskData.turns[feedback_idx],
                                                                        incorrectTurns, setIncorrectTurns, setSwitch,
                                                                        index, subtaskData, num_dialogues,
                                                                        annotations, setAnnotations, annot,
                                                                        startupPage, startupPageNum, mistakes, mephistoProps); }}/>

    React.useEffect(() => {
        // if message top of current feedback message not visible on first load, then scrollIntoView
        const show_message = document.getElementById(`chat_message_${index}_${feedback_idx}`);
        const scrollable_content_pane = document.getElementById('onboarding-feedback-right-top-pane');
        if (scrollable_content_pane !== null && isSwitch) {
            setSwitch(false);
            if (!(show_message.offsetTop >= scrollable_content_pane.scrollTop &&
                show_message.offsetTop <= scrollable_content_pane.scrollTop + scrollable_content_pane.clientHeight)) {
                show_message.scrollIntoView();
            }
        }
    });


    return <AnnotationView scrollPaneName={'onboarding-feedback-right-top-pane'} is_task_ongoing={is_task_ongoing} task_description={task_description}
                         currentAnnotationQ={currentAnnotationQ} progress_msg={progress_msg}
                         full_dialogue_annotation={full_dialogue_annotation}
                         contentPn={contentPn} submitBtn={submitBtn} />


}

function handleFeedbackSubmit(feedbackAnnot, true_turn, incorrectTurns, setIncorrectTurns, setSwitch, index, subtaskData, num_dialogues, annotations, setAnnotations, annot, startupPage, startupPageNum, mistakes, mephistoProps){

    const { sendMessage } = mephistoProps;

    const feedback_idx = incorrectTurns[0][incorrectTurns[1]];
    const [correct, incorrect, total, uincorrect_idxs] = compare_all_answers(feedback_idx, feedbackAnnot, true_turn);

    if (correct / total < 1) {
        alert("You have not properly corrected your answers! Make sure your selections match the displayed correct selections and submit again.")
    }
    else {
        setIncorrectTurns([incorrectTurns[0], incorrectTurns[1] + 1, incorrectTurns[2]]);

        if (incorrectTurns[0].length === incorrectTurns[1] + 1) { // all feedback for this task has been completed, so save progress
            const time_label = getTaskTimeKey(true, index, annot);
            const times = addEndTime(annotations, time_label, Date.now());
            const updatedAnnotations = {...annotations, [time_label]: times,
                                        "lastIndex": index, "lastAnnot": annot};
            setAnnotations(updatedAnnotations);

            const nindex = index + 1;
            const trainingCompleted = nindex >= num_dialogues;

            if (!trainingCompleted) { // only send message to mephisto if not all training tasks are done bc parent component will handle submitting in the final completion stage
                sendMessage({...updatedAnnotations,
                    "lastIncorrectTurns": [incorrectTurns[0], incorrectTurns[1] + 1, incorrectTurns[2]],
                    "mistakes": mistakes,
                    "lastStartupPage": startupPage, "lastStartupPageNum": startupPageNum})
            }
        }
    }
    setSwitch(true);

}