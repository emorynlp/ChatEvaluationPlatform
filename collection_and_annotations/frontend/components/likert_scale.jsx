
import React from "react";
import Likert from 'react-likert-scale';

function handleChange(selection, label, subtaskIdx, annotations, setAnnotations) {
      // Generate new entry in annotations for this subtask, if it doesn't already exist
    if (!(subtaskIdx in annotations)) {
        var answersForSubtaskIndex = {
            'subtask_index': subtaskIdx,
            'likert': {[label]: selection.value},
            'data': {}
        };
        setAnnotations({...annotations, [subtaskIdx]: answersForSubtaskIndex})
    }
    else {
        let updated_subtask_ratings = {...annotations[subtaskIdx]['likert'], [label]: selection.value}
        let updated_subtask = {...annotations[subtaskIdx], 'likert': updated_subtask_ratings}
        setAnnotations({...annotations, [subtaskIdx]: updated_subtask})
    }
}



function LikertScale({annotationQ, subtaskIdx, annotations, setAnnotations, speakerLabel, otherLabel}) {



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
                 const item = (<Likert key={`${o.question}_${subtaskIdx}`} id={`${o.question}_${subtaskIdx}`}
                                       question={o.question.replaceAll('SPEAKER_X', speakerLabel).replaceAll('SPEAKER_Y', otherLabel)}
                                       responses={options}
                                       onChange={(selection) => handleChange(selection, `${o.label}`, subtaskIdx, annotations, setAnnotations)}
                    />)
                 return item;
                }
            )
            }
        </div>
    )
}

export { LikertScale };