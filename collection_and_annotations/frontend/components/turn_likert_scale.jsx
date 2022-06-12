
import React from "react";
import Likert from 'react-likert-scale';

function handleChange(selection, label, text, agentIdx, subtaskIdx, turnIdx, annotations, setAnnotations) {
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



function TurnLikertScale({annotationQ, text, agentIdx, subtaskIdx, turnIdx, annotations, setAnnotations}) {


    let options = [
          { value: '1', text: '1' },
          { value: '2', text: '2' },
          { value: '3', text: '3' },
          { value: '4', text: '4' },
          { value: '5', text: '5' }
        ]

    // if (annotationQ.hasOwnProperty('label_details')) {
    //     options = options.map(opt => {
    //         const withdetails = (<span>{opt.text} <br/> {annotationQ.label_details[opt.value]}</span>);
    //         return {value: opt.value, text: withdetails};
    //     });
    // }

    return (
        <div>
            {annotationQ.options.map(o =>{
                 const item = (<Likert key={`${o.question}_${subtaskIdx}_${turnIdx}`} id={`${o.question}_${subtaskIdx}_${turnIdx}`} question={o.question} responses={options}
                             onChange={(selection) => handleChange(selection, `${o.label}`, text, agentIdx, subtaskIdx, turnIdx, annotations, setAnnotations)}
                    />)
                 return item;
                }
            )
            }
        </div>
    )
}

export { TurnLikertScale };