
import React from "react";
import { boolPrevTurnExpect } from './tasks/dependency_checks.jsx'

function get_descendant_questions(answer_flows, key) {
    let all_questions = [];
    for (const child_question of Object.keys(answer_flows[key])) {
        all_questions.push(child_question);
        for (const opt of Object.keys(answer_flows[key][child_question])){
            all_questions.push(...get_descendant_questions(answer_flows[key][child_question], opt));
        }
    }
    return all_questions;
}

function clearDeselectedRadio(deselected, answer_flows, turn_annotations) {
    for(let i = 0; i < deselected.length; i++ ) {
        if( !deselected[i].checked ) {
            const idstr = deselected[i].id;
            const unselected_opt = idstr.slice(idstr.indexOf('++')+2);
            for (const question of get_descendant_questions(answer_flows, unselected_opt)){
                if (question in turn_annotations) {
                    delete turn_annotations[question];
                }
            }
        }
    }
}

function clearDeselectedCheckbox(deselected, deselected_question, deselected_answer, answer_flows, turn_annotations) {
    if( !deselected.checked ) {
        delete turn_annotations[deselected_question]
        for (const question of get_descendant_questions(answer_flows, deselected_answer)){
            if (question in turn_annotations) {
                delete turn_annotations[question];
            }
        }
    }
}

function handleChange(evt, type, answer_flows, question, answer, subtaskIdx, turnIdx, text, agentIdx, annotations,
                      setAnnotations, setLastAnnotated, setDoAdjustScroll){
    if (setLastAnnotated){ setLastAnnotated(turnIdx); } // update last annotated turn to be this turn

    const lastMessage = setDoAdjustScroll ? document.getElementById(`chat_message_${subtaskIdx}_${turnIdx}`) : null;
    const rightTopPane = document.getElementById(`right-top-pane`);
    if (lastMessage !== null){
        // const new_scroll_values = [0, rightTopPane.scrollTop, rightTopPane.scrollHeight, lastMessage.offsetTop];
        let adjust = rightTopPane.scrollTop - lastMessage.offsetTop;
        setDoAdjustScroll(adjust)
    }

    let updated;
    let updated_turn;
    if (!(subtaskIdx in annotations)) {
        var answersForSubtaskIndex = {
            'subtask_index': subtaskIdx,
            'data': {}
        };
        answersForSubtaskIndex['data'][turnIdx] = {
            'turn_idx': turnIdx,
            'text': text,
            'agent_idx': agentIdx,
            [question]: answer
        }
        updated_turn = answersForSubtaskIndex['data'][turnIdx];
        updated = answersForSubtaskIndex;
    }
    else if (!(turnIdx in annotations[subtaskIdx]['data'])){
        let updated_subtask_data = {...annotations[subtaskIdx]['data'],
                                [turnIdx]: {
                                    'turn_idx': turnIdx,
                                    'text': text,
                                    'agent_idx': agentIdx,
                                    [question]: answer
                                }}
        updated_turn = updated_subtask_data[turnIdx];
        updated = {...annotations[subtaskIdx], 'data': updated_subtask_data};
    }
    else {
        updated_turn = {...annotations[subtaskIdx]['data'][turnIdx], [question]: answer}
        let updated_subtask_data = {...annotations[subtaskIdx]['data'], [turnIdx]: updated_turn}
        updated = {...annotations[subtaskIdx], 'data': updated_subtask_data}
    }

    let deselect_from = null;
    if (type === 'radio'){
       deselect_from = document.getElementsByName(evt.target.name);
       clearDeselectedRadio(deselect_from, answer_flows, updated_turn)
    }
    else if (type === 'checkbox'){
        clearDeselectedCheckbox(evt.target, question, answer, answer_flows, updated_turn)
    }

    setAnnotations({...annotations, [subtaskIdx]: updated})
}

function get_annotation(subtaskIdx, turnIdx, question, annotations) {
    if (annotations !== null && annotations !== undefined && subtaskIdx in annotations) {
        const annotation_data = annotations[subtaskIdx]["data"]
        if (turnIdx in annotation_data && question in annotation_data[turnIdx]) {
            return annotation_data[turnIdx][question];
        }
    }
    return null;
}

function get_radio(strid, subtaskIdx, turnIdx, question, options, indent, showHelp, text, agentIdx, annotations, setAnnotations,
                     setLastAnnotated, setDoAdjustScroll, answer_flows, enabled){
    const speakerLabel = agentIdx === 0 ? 'Sam' : 'Alex'
    const otherLabel = agentIdx === 0 ? 'Alex' : 'Sam'
    const qstrid = `${strid}_${question}`;

    return (
        <div key={qstrid} style={{marginLeft: `${indent}%`}}>
            <span style={{fontWeight: "bold", paddingRight: "10px"}}>{question.replaceAll('SPEAKER_X', speakerLabel).replaceAll('SPEAKER_Y', otherLabel)}</span>
            {showHelp ? helpButton(question) : ''}
            <br/>
            {options.filter(opt => !SPECIAL.includes(opt)).map(opt => {
                    const is_selected = get_annotation(subtaskIdx, turnIdx, question, annotations) === opt;
                    return (
                        <div key={`${qstrid}_${opt}`}>
                            <input type="radio"
                                   checked={is_selected}
                                   disabled={!enabled}
                                   id={`${qstrid}++${opt}`}
                                   name={qstrid}
                                   onChange={(evt) => handleChange(evt, 'radio', answer_flows, question, opt, subtaskIdx, turnIdx,
                                       text, agentIdx, annotations, setAnnotations, setLastAnnotated, setDoAdjustScroll)}/>
                            <span style={{
                                fontWeight: "normal",
                                paddingLeft: "10px"
                            }}>{opt.replaceAll('SPEAKER_X', speakerLabel).replaceAll('SPEAKER_Y', otherLabel)}</span>
                            <br/>
                            {is_selected ?
                                get_annotation_elements(strid, subtaskIdx, turnIdx, answer_flows[opt], text, agentIdx, annotations,
                                    setAnnotations, setLastAnnotated, setDoAdjustScroll, showHelp, indent + 5, enabled)
                                : ''}
                        </div>)
                }
                )
            }
        </div>
    )
}

function get_checkbox(strid, subtaskIdx, turnIdx, question, options, indent, showHelp, text, agentIdx, annotations, setAnnotations,
                     setLastAnnotated, setDoAdjustScroll, answer_flows, enabled){
    const speakerLabel = agentIdx === 0 ? 'Sam' : 'Alex'
    const otherLabel = agentIdx === 0 ? 'Alex' : 'Sam'
    const qstrid = `${strid}_${question}`;
    return (
        <div key={qstrid} style={{marginLeft: `${indent}%`}}>
            {options.filter(opt => !SPECIAL.includes(opt)).map(opt => {
                    const is_selected = get_annotation(subtaskIdx, turnIdx, question, annotations) === opt;
                    return (
                        <div key={`${qstrid}_${opt}`}>
                            <input type="checkbox"
                                   checked={is_selected}
                                   disabled={!enabled}
                                   id={`${qstrid}++${opt}`}
                                   name={qstrid}
                                   onChange={(evt) => handleChange(evt, 'checkbox', answer_flows, question, opt, subtaskIdx, turnIdx,
                                       text, agentIdx, annotations, setAnnotations, setLastAnnotated, setDoAdjustScroll)}/>
                            <span style={{
                                fontWeight: "normal",
                                paddingLeft: "10px"
                            }}>{opt.replaceAll('SPEAKER_X', speakerLabel).replaceAll('SPEAKER_Y', otherLabel)}</span>
                            {showHelp ? helpButton(question) : ''}
                            <br/>
                            {is_selected ? get_annotation_elements(strid, subtaskIdx, turnIdx, answer_flows[opt], text,
                                                                    agentIdx, annotations, setAnnotations,
                                                                    setLastAnnotated, setDoAdjustScroll, showHelp,
                                                                    indent + 5, enabled) : ''}
                        </div>)
                }
                )
            }
        </div>
    )
}

const SPECIAL = ['_dep_', '_type_'];

function get_annotation_elements(strid, subtaskIdx, turnIdx, options, text, agentIdx, annotations, setAnnotations, setLastAnnotated, setDoAdjustScroll, showHelp, indent=0, enabled=true) {
    // return value is list of span elements

    const dependency_checks = {"boolPrevTurnExpect": boolPrevTurnExpect}

    let to_display = indent===0 ? [] : [(<br key={0}/>)]; // top level annotation prompt does not need line break separation
    for (let [question, answer_flows] of Object.entries(options)) {
        const answers = Object.keys(answer_flows);
        let display = true;
        if (answers.includes('_dep_')){ // check that question dependency is met
            const func_str = Object.keys(answer_flows['_dep_'])[0]
            display = dependency_checks[func_str](turnIdx, annotations[subtaskIdx])
        }
        let type = answers.includes('_type_') ? Object.keys(answer_flows['_type_'])[0] : 'radio';
        if (display) {
            let element = null;
            if (type === 'checkbox') {
                element = get_checkbox(strid, subtaskIdx, turnIdx, question, answers, indent, showHelp,
                    text, agentIdx, annotations, setAnnotations, setLastAnnotated, setDoAdjustScroll, answer_flows, enabled);
            }
            else {
                element = get_radio(strid, subtaskIdx, turnIdx, question, answers, indent, showHelp,
                    text, agentIdx, annotations, setAnnotations, setLastAnnotated, setDoAdjustScroll, answer_flows, enabled);
            }
            to_display.push(element)
            to_display.push((<br key={to_display.length}/>))
        }
    }
    if (to_display.length === 1 && to_display[0].type === "br"){ // only line break
        return [];
    }
    return indent===0 ? to_display.slice(0, -1) : to_display; // nested questions look better with trailing line break
}

function helpButton(elementId) {
  return (
      <button
          onClick={(evt) => {
                var el = document.getElementById(elementId);
                el.click();
                el.scrollIntoView();
              }
          }
          style={{background: "none", border: "none"}}>
          <i className="fa fa-question-circle" style={{color: "red"}}/>
      </button>
  )
}

export { get_annotation_elements }