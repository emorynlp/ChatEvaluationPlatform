
import React from "react";
import Select from 'react-select'

function handleChange(label, selection, subtaskIdx, turnIdx, text, agentIdx, annotationBuckets, annotations, setAnnotations) {
      // Generate new entry in annotations for this subtask, if it doesn't already exist
    if (!(subtaskIdx in annotations)) {
        var answersForSubtaskIndex = {
            'subtask_index': subtaskIdx,
            'data': {}
        };
        answersForSubtaskIndex['data'][turnIdx] = {
            'turn_idx': turnIdx,
            'text': text,
            'agent_idx': agentIdx,
            [label]: selection.value
        }
        setAnnotations({...annotations, [subtaskIdx]: answersForSubtaskIndex})
    }
    else if (!(turnIdx in annotations[subtaskIdx]['data'])){
        let updated_subtask_data = {...annotations[subtaskIdx]['data'],
                                [turnIdx]: {
                                    'turn_idx': turnIdx,
                                    'text': text,
                                    'agent_idx': agentIdx,
                                    [label]: selection.value
                                }}
        let updated_subtask = {...annotations[subtaskIdx], 'data': updated_subtask_data}
        setAnnotations({...annotations, [subtaskIdx]: updated_subtask})
    }
    else {
        let updated_turn = {...annotations[subtaskIdx]['data'][turnIdx], [label]: selection.value}
        let updated_subtask_data = {...annotations[subtaskIdx]['data'], [turnIdx]: updated_turn}
        let updated_subtask = {...annotations[subtaskIdx], 'data': updated_subtask_data}
        setAnnotations({...annotations, [subtaskIdx]: updated_subtask})
    }
}

function SingleSelect({label, annotationBuckets, subtaskIdx, turnIdx, text, agentIdx, onUserInputUpdate, annotations, setAnnotations}) {

    return (
        <Select id={`single_select_${subtaskIdx}_${turnIdx}`} options={annotationBuckets}
                className="basic-multi-select" classNamePrefix="select"
                onChange={(selection) => handleChange(label, selection, subtaskIdx, turnIdx, text, agentIdx, annotationBuckets, annotations, setAnnotations)}/>
    )
}

export { SingleSelect };