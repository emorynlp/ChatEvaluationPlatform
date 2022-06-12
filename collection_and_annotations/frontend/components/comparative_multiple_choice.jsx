import React from "react";

function handleChange(subtaskIdx, question, answer, annotations, setAnnotations){
    if (!(subtaskIdx in annotations)) {
        var answersForSubtaskIndex = {
            'subtask_index': subtaskIdx,
            'comparative': {[question]: answer},
            'data': {}
        };
        setAnnotations({...annotations, [subtaskIdx]: answersForSubtaskIndex})
    }
    else {
        let updated_subtask_ratings = {...annotations[subtaskIdx]['comparative'], [question]: answer}
        let updated_subtask = {...annotations[subtaskIdx], 'comparative': updated_subtask_ratings}
        setAnnotations({...annotations, [subtaskIdx]: updated_subtask})
    }
}

export function ComparativeMC({subtaskIdx, annotationQ, annotations, setAnnotations, speakerLabel, otherLabel}) {
    const question = annotationQ.question;
    return (
        <div>
            <span style={{fontWeight: "bold", paddingRight: "10px"}}>{question.replaceAll('SPEAKER_X', speakerLabel).replaceAll('SPEAKER_Y', otherLabel)}</span>
            {annotationQ.options.map((opt,idx) => (
                <div key={`${question}_${opt}_${idx}`}>
                    <input type="radio"
                           // checked={is_selected}
                           // disabled={!enabled}
                           id={`${question}++${opt}`}
                           name={question}
                           onChange={(evt) => handleChange(subtaskIdx, question, opt, annotations, setAnnotations)}
                    />
                    <span style={{fontWeight: "normal", paddingLeft: "10px"}}>{opt}</span>
                </div>
                )
            )
            }
            <br/>
            <br/>
        </div>
    );

}