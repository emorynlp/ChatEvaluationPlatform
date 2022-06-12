
import React from "react";
import {CONNECTION_STATUS, getInitTaskData} from "mephisto-task";
import Bowser from "bowser";

// Check if the current browser is Google Chrome or Firefox, using *bowser*
const browser = Bowser.getParser(window.navigator.userAgent);
export function isSupportedBrowser() {
  return browser.satisfies({
    chrome: ">=16",
    firefox: ">=11"
  });
}

export function pairs(array) {
    let p = [];
    for (var i=0; i < array.length; i+=2){
        p.push([array[i], array[i+1]]);
    }
    return p;
}

export function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.

    for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
    }
    return true;
}

export function array_diff(arr1, arr2){
    return arr1.filter(x => !arr2.includes(x)).concat(arr2.filter(x => !arr1.includes(x)))
}

export function compare_all_answers(turn_idx, annotated, true_turn) {
    let ucorrect, uincorrect, utotal;
    let incorrect_idxs = [];
    if (true_turn.answers !== undefined && true_turn.answers.hasOwnProperty('_disjunction')) {
        // multiple correct answers, if at least one matches then it is correct
        let answers_to_check = true_turn.answers.options;
        for (const answer of answers_to_check) {
            [ucorrect, uincorrect, utotal] = compare_answers(turn_idx, annotated, answer)
            if (ucorrect === 1) { // found correct match so end here
                break;
            }
        }
        if (uincorrect === 1){
            incorrect_idxs.push(turn_idx);
        }
    } else {
        // only one correct answer
        [ucorrect, uincorrect, utotal] = compare_answers(turn_idx, annotated, true_turn.answers)
        if (uincorrect === 1) {
            incorrect_idxs.push(turn_idx);
        }
    }
    return [ucorrect, uincorrect, utotal, incorrect_idxs];
}

export function compare_answers(turn_idx, annotated, true_answer){
    let total=0; let correct=0; let incorrect=0;
    if (true_answer !== undefined) { // all annotatable turns must have an answer element (even if just empty dict for no selection being correct)
        total++;
        if (Object.keys(true_answer).length > 0) { // there is at least one correct selection
            if (annotated !== undefined && annotated.hasOwnProperty(turn_idx)) {
                for (const [key, value] of Object.entries(true_answer)) {
                    const annotated_turn = annotated[turn_idx];
                    if (annotated_turn.hasOwnProperty(key)) {
                        if (Array.isArray(value)) {
                            const diff = array_diff(value, annotated_turn[key]);
                            if (diff.length > 0) {
                                incorrect++;
                                return [correct, incorrect, total];
                            }
                        } else if (typeof value === 'string') {
                            if (annotated_turn[key] !== value) {
                                incorrect++;
                                return [correct, incorrect, total];
                            }
                        } else {
                            console.log(`answer ${value} for key ${key} is not supported!`)
                        }
                    } else { // any missing answer counts as incorrect for this turn, unless the true value is empty string
                        if (value === ''){
                            correct++;
                        } else {
                            incorrect++;
                        }
                        return [correct, incorrect, total];
                    }
                }
                correct++; // did not break by identifying incorrect selections
                // do not need to check if annotated_turn has anything other than true_answer because all independent selections are saved as single key: value_list
                // and, for dependent selections, it is already handled by checking true_answer
                // (e.g. to get something different in annotated_turn would require disagreeing on something present in true_answer)
            } else { // no annotations for turn found
                incorrect++;
            }
        } else { // no selection is correct,
            if (annotated !== undefined && annotated.hasOwnProperty(turn_idx)) {
                // still could be correct --> check that no annotations were recorded
                const annotated_turn = annotated[turn_idx];
                const annot_keys = Object.keys(annotated_turn).filter(x => !(['agent_idx', 'text', 'turn_idx'].includes(x))) // todo : needs to be updated if more things saved in turn annotations
                annot_keys.length === 0 ? correct++ : incorrect++;
            } else {
                correct++;
            }
        }
    }
    return [correct, incorrect, total];
}

export function selectCorrectAnswerToShow(answers) {
    if (answers && answers.hasOwnProperty('_disjunction')) {
        for (const opt of answers.options) {
            for (const v of Object.values(opt)) {
                if (v.includes("misleading")) {
                    return opt;
                }
            }
        }
        for (const opt of answers.options) {
            for (const v of Object.values(opt)) {
                if (v.includes("I don't know")) {
                    return opt;
                }
            }
        }
      return answers.options[0]; // select one of the multiple options to show as the correct selection
    }
    return answers;
}

export async function waitScroll(lastMessage, rightTopPane, adjustScroll) {
    await lastMessage.scrollIntoView();
    let adjusted = lastMessage.offsetTop + adjustScroll;
    if (adjusted < 0){
        adjusted = 0;
    }
    else {
        if (adjusted > rightTopPane.scrollHeight) {
            adjusted = rightTopPane.scrollHeight;
        }
    }
    rightTopPane.scrollTo(0, adjusted);
}

export function addEndTime(annotations, time_label, curr_time) {
    // time for each task is saved as a list of (start, end) tuples
    const previousTimes = annotations[time_label];
    let previousTime = annotations[time_label].at(-1);
    previousTime.push(curr_time);
    return [...previousTimes.slice(0, -1), previousTime];
}

export function addStartTime(annotations, time_label, curr_time) {
    // time for each task is saved as a list of (start, end) tuples
    if (annotations.hasOwnProperty(time_label)) {
        const previousTimes = annotations[time_label];
        return [...previousTimes, [curr_time]];
    }
    return [[curr_time]];
}

export function getTaskTimeKey(isOnboarding, index, annot) {
    return isOnboarding ? `duration_onboarding_task_${index}_${annot}`
                        : `duration_task_${index}_${annot}`;
}

export async function waitForInitTaskData(workerId, agentId) {
    const response = await getInitTaskData(workerId, agentId);
    return response.data.init_data;
}

export function checkConnection(status, agentState) {
    if (status === CONNECTION_STATUS.WEBSOCKETS_FAILURE) {
        return"Sorry, but we found that your browser does not support WebSockets. Please consider using the latest version of Google Chrome or Firefox and check this HIT again.";
    } else if (status === CONNECTION_STATUS.FAILED) {
        return "Unable to initialize. We may be having issues with our servers. Please refresh the page, or if that isn't working return the HIT and try again later if you would like to work on this task.";
    } else if (status === CONNECTION_STATUS.DISCONNECTED_SERVER) {
        return agentState.done_text;
    } else if (status === CONNECTION_STATUS.DISCONNECTED) {
        return "Please refresh the page. If that does not resolve the issue, please contact the project administrators.";
    }
    return null;
}

export function simpleDisplay({header, message}) {
    return (
        <div style={{margin: 0, padding: 0, height: '100%', textAlign: 'center'}}>
            {header ? (<h2>{header}</h2>) : ''}
            <br/>
            {message ? (<p className="onboarding-description">{message}</p>) : ''}
        </div>
    );
}