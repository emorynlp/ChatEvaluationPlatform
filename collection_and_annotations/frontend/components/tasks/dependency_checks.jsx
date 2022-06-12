
import React from "react";

function boolPrevTurnExpect(turnIdx, annotations){
    if (turnIdx === 1) {
        return true;
    }
    const expectQuestions = [["If you were to respond to what SPEAKER_X just said (as SPEAKER_Y), would you think it is appropriate to move on to a new talking point WITHOUT directly acknowledging what SPEAKER_X just said?", "No"],
        ["Did SPEAKER_X prompt SPEAKER_Y for information?", "Yes"],
        ["Is SPEAKER_X following up on what SPEAKER_Y just said last turn?", "No"]]
    for (let i = 0; i < expectQuestions.length; i++){
        let [q, v] = expectQuestions[i];
        if (turnIdx-1 in annotations["data"] && q in annotations["data"][turnIdx-1]) {
            if (annotations["data"][turnIdx-1][q].includes(v)) {
                return true;
            }
        }
    }
    return false;
}

export { boolPrevTurnExpect };