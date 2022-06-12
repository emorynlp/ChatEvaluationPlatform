import React from "react";

function SubtaskSubmitButton({ subtaskIndex, numSubtasks, annotIndex, indices_to_annotate, numAnnots, onSubtaskSubmit, annotationQ, annotations, taskConfig, isPreview, check_completion=true }) {
    const complete = check_completion ? check_annotation_completion(annotationQ, annotations[subtaskIndex], taskConfig, indices_to_annotate) : true;
    return (
    <div style={{ textAlign: 'center' }}>
      <button id="submit-button"
        className="button is-link"
        onClick={onSubtaskSubmit}
        disabled={!complete || isPreview}
      >
        {subtaskIndex === (numSubtasks - 1) && annotIndex === (numAnnots - 1) ? "Submit" : "Next"}
      </button>
    </div>
  )
}

function check_annotation_completion(annotationQ, annotations, taskConfig, indices_to_annotate){
    // annotationQ contains 'require' key that specifies what annotations must be completed to submit the task
    //      'level': 'dialogue' or 'turn'
    if (annotationQ.hasOwnProperty("require")){
        // if (!annotations) { return false; }
        const level = annotationQ.require.level;
        if (annotationQ.require.hasOwnProperty("labels")){ // todo - special handle of specified completion label sets

        }
        else{
            if (annotationQ.config === 'likert-5-dialogue'){
                const labels = annotationQ.options.map(opt => opt.label);
                return check_flat_completion(annotations, labels, level, indices_to_annotate, 'likert');
            } else if (annotationQ.config === 'comparative'){
                const labels = [annotationQ.question];
                return check_flat_completion(annotations, labels, level, indices_to_annotate, 'comparative');
            } else if (annotationQ.config.includes('button_flow')){
                return check_hierarchical_completion(annotations, annotationQ.options, level, indices_to_annotate, "data");
            }
            else if (annotationQ.config === 'likert-5-turn'){
                const labels = annotationQ.options.map(opt => opt.label);
                return check_flat_completion(annotations, labels, level, indices_to_annotate, "data");
            }
        }
    }

    return true; // no requirements, so annotation always considered complete
}

function check_hierarchical_completion(annotations, hierarchy, level, indices_to_annotate, slice=null){
    const relevant_annot = slice !== null && !is_empty(annotations) ? annotations[slice] : annotations;
    if (level === 'dialogue'){
        return is_full_solution(hierarchy, relevant_annot);
    } else if (level === 'turn'){
        for (const idx of indices_to_annotate) {
            const turn_annot = !is_empty(relevant_annot) ? relevant_annot[idx] : null;
            if (!is_full_solution(hierarchy, turn_annot)) {
                return false;
            }
        }
        return true;
    }
    console.log(`Level ${level} of requirement of annotation is not handled!`)
    return false;
}

function is_full_solution(question_flow, annotations) {
    for (const q in question_flow) {
        if (is_required(question_flow[q])) { // required questions
            if (is_empty(annotations) || !annotations.hasOwnProperty(q) || is_empty(annotations[q])) {
                return false;
            }
            if (!is_full_solution(question_flow[q][annotations[q]], annotations)){
                return false;
            }
        } else if (!is_empty(annotations) && !is_empty(annotations[q])) { // not required, but has been answered
            if (!is_full_solution(question_flow[q][annotations[q]], annotations)){
                return false;
            }
        }
    }
    return true;
}

function has_all_labels(labels, annotations){
    if (is_empty(annotations)) { return false; }
    for (const l of labels){
        if (!annotations.hasOwnProperty(l)){
            return false;
        } else if (is_empty(annotations[l])) { //null, undefined, or empty string
            return false;
        }
    }
    return true
}

function check_flat_completion(annotations, labels, level, indices_to_annotate, slice=null){
    if (is_empty(annotations)) { return false; }
    const relevant_annot = slice !== null ? annotations[slice] : annotations;
    if (!relevant_annot) { return false; }
    if (level === 'dialogue'){
        return has_all_labels(labels, relevant_annot)
    }else if (level === 'turn'){ // todo - need to know how many annotatable turns there are to check
        for (const idx of indices_to_annotate) {
            const turn_annot = !is_empty(relevant_annot) ? relevant_annot[idx] : null;
            if (!has_all_labels(labels, turn_annot)) {
                return false;
            }
        }
        return true;
    }
    console.log(`Level ${level} of requirement of annotation is not handled!`)
    return false;
}

function is_empty(val){
    // checks that val is null, undefined, or empty string
    return val === null || val === undefined || val === "";
}

function is_required(obj) {
    return !(obj.hasOwnProperty('_type_') && Object.keys(obj['_type_'])[0] === 'checkbox');

}

export { SubtaskSubmitButton };