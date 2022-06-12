
import React from "react";
import Select from 'react-select'

function handleChange(task_title, selection, subtaskIdx, turnIdx, text, agentIdx, annotationBuckets, annotations, setAnnotations) {
      // Generate new entry in annotations for this subtask, if it doesn't already exist
    let labels = selection.map((lab) => lab.value);
    let options = annotationBuckets.map((o) => o.value);
    if (!(subtaskIdx in annotations)) {
        var answersForSubtaskIndex = {
            'subtask_index': subtaskIdx,
            'data': {}
        };
        answersForSubtaskIndex['data'][turnIdx] = {
            'turn_idx': turnIdx,
            'text': text,
            'agent_idx': agentIdx,
            [`${task_title}_labels`]: labels
        }
        if (labels.length === 0) {
            delete answersForSubtaskIndex['data'][turnIdx][`${task_title}_labels`];
        }
        setAnnotations({...annotations, [subtaskIdx]: answersForSubtaskIndex})
    }
    else if (!(turnIdx in annotations[subtaskIdx]['data'])){
        let updated_subtask_data = {...annotations[subtaskIdx]['data'],
                                [turnIdx]: {
                                    'turn_idx': turnIdx,
                                    'text': text,
                                    'agent_idx': agentIdx,
                                    [`${task_title}_labels`]: labels
                                }}
        if (labels.length === 0) {
            delete updated_subtask_data[turnIdx][`${task_title}_labels`];
        }
        let updated_subtask = {...annotations[subtaskIdx], 'data': updated_subtask_data}
        setAnnotations({...annotations, [subtaskIdx]: updated_subtask})
    }
    else {
        let updated_turn = {...annotations[subtaskIdx]['data'][turnIdx], [`${task_title}_labels`]: labels}
        if (labels.length === 0) {
            delete updated_turn[`${task_title}_labels`];
        }
        let updated_subtask_data = {...annotations[subtaskIdx]['data'], [turnIdx]: updated_turn}
        let updated_subtask = {...annotations[subtaskIdx], 'data': updated_subtask_data}
        setAnnotations({...annotations, [subtaskIdx]: updated_subtask})
    }
}

function Multiselect({strid, annotationBuckets, task_title, subtaskIdx, turnIdx, text, agentIdx, onUserInputUpdate, annotations, setAnnotations, enabled=true}) {
    const selections = subtaskIdx in annotations && turnIdx in annotations[subtaskIdx]["data"]
                        && `${task_title}_labels` in annotations[subtaskIdx]["data"][turnIdx] ?
                            annotations[subtaskIdx]["data"][turnIdx][`${task_title}_labels`]
                            : [];
    return (
        <Select id={strid} isMulti isDisabled={!enabled}
                options={annotationBuckets.filter((o)=> !('speaker' in o) || o.speaker===agentIdx)}
                defaultValue={annotationBuckets.filter((o)=> selections.includes(o.value))}
                className="basic-multi-select" classNamePrefix="select"
                onChange={(selection) => handleChange(task_title, selection, subtaskIdx, turnIdx, text, agentIdx, annotationBuckets, annotations, setAnnotations)}/>
    )
}

export { Multiselect };