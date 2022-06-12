
import React from "react";
import Select from 'react-select'
import { pairs } from './utils.jsx'

function handleChange(selection, label, subtaskIdx, annotations, setAnnotations) {
      // Generate new entry in annotations for this subtask, if it doesn't already exist
    if (!(subtaskIdx in annotations)) {
        var answersForSubtaskIndex = {
            'subtask_index': subtaskIdx,
            'ratings': {[label]: selection.value},
            'data': {}
        };
        setAnnotations({...annotations, [subtaskIdx]: answersForSubtaskIndex})
    }
    else {
        let updated_subtask_ratings = {...annotations[subtaskIdx]['ratings'], [label]: selection.value}
        let updated_subtask = {...annotations[subtaskIdx], 'ratings': updated_subtask_ratings}
        setAnnotations({...annotations, [subtaskIdx]: updated_subtask})
    }
}



function DialogueSingleSelect({annotationQ, subtaskIdx, onUserInputUpdate, annotations, setAnnotations}) {

    const options = [
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
          { value: '5', label: '5' }
        ]

    return (
        <div>
            <br/>
            <span dangerouslySetInnerHTML={{ __html: annotationQ.question }}/>
            <table>
                <tbody>
                    {pairs(annotationQ.options).map((pair) => {
                        let o = pair[0];
                        let o2 = pair[1];
                        return (
                            <tr className='borderless-tr' key={`dialogue_${o.label}_${subtaskIdx}`}>
                                <td style={{padding: "5px"}}><span style={{"fontWeight": 'bold'}}>{o.label}</span></td>
                                <td style={{padding: "5px"}}>
                                    <Select id={`dialogue_${o.label}_${subtaskIdx}`}
                                            options={options}
                                            className="basic-multi-select"
                                            classNamePrefix="select"
                                            onChange={(selection) => handleChange(selection, `${o.label}`, subtaskIdx, annotations, setAnnotations)}/>
                                </td>
                                {o2 !== undefined ?
                                    (<div>
                                        <td style={{padding: "5px"}}><span style={{"fontWeight": 'bold'}}>{o2.label}</span></td>
                                        <td style={{padding: "5px"}}>
                                            <Select id={`dialogue_${o2.label}_${subtaskIdx}`}
                                                    options={options}
                                                    className="basic-multi-select"
                                                    classNamePrefix="select"
                                                    onChange={(selection) => handleChange(selection, `${o2.label}`, subtaskIdx, annotations, setAnnotations)}/>
                                        </td>
                                    </div>) : <td/>
                                 }
                            </tr>)
                        }
                    )}
                </tbody>
            </table>
        </div>
    )
}

export { DialogueSingleSelect };