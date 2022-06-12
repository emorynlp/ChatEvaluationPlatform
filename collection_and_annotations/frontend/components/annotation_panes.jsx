
import React from "react";
import { ChatMessage } from "./message.jsx";
import {LeftPane, RightBottomPane, RightTopPane} from "./panes.jsx";
import {Col, Grid, Row} from "react-bootstrap";

export function AnnotationView({scrollPaneName, is_task_ongoing, task_description, currentAnnotationQ, progress_msg, full_dialogue_annotation,
                               contentPn, contentHeight, tabHeight, submitBtn, sideBySide}) {
    let rtp;
    if (sideBySide){
      rtp = contentPn;
    } else{
      rtp = (<RightTopPane scrollPaneName={scrollPaneName} height={contentHeight}>
              {contentPn}
          </RightTopPane>);
    }

  return (
    <div style={{ margin: 0, padding: 0, height: '100%' }}>
      <LeftPane>
        {is_task_ongoing ? <div>{task_description || 'Task Description Loading'}</div>  : ''}
      </LeftPane>
        {rtp}
      <RightBottomPane height={tabHeight}>
        {is_task_ongoing ?
          // <div style={{textAlign: 'center'}}>
          <div>
            <span className="progress-str"><b> {progress_msg} </b><br/><br/></span>
            <div>
                {full_dialogue_annotation}
                {submitBtn}
            </div>
          </div>
          : ''}
      </RightBottomPane>
      <div style={{ clear: 'both' }}>
      </div>
    </div>
  );
}

export function ContentPane({ subtaskData, annotationQ, subtaskIndex,
                       annotations, setAnnotations, lastAnnotatedTurn, setLastAnnotated, indices_to_annotate,
                       setDoAdjustScroll, turnSpecs, feedbackMode, interactive}) {
  const dialogueId = subtaskData.dialogue_id;
  subtaskData = subtaskData.turns;

  return (
    <div>
      {subtaskData.map(
        (m, idx) => {
            let speaker;
            if (interactive){
                speaker = m.agent_idx === 0 ? 'You' : 'Partner';
            } else {
                speaker = ('speaker_label' in m) ? m.speaker_label : null;
            }
            return <div key={`${subtaskIndex}_${idx}`}>
                <ChatMessage
                    class_spec={(turnSpecs !== undefined && turnSpecs.hasOwnProperty(idx)) ? turnSpecs[idx] : undefined}
                    dialogueId={dialogueId}
                    text={m.text}
                    agentIdx={m.agent_idx}
                    subtaskIdx={subtaskIndex}
                    turnIdx={idx}
                    annotationQ={annotationQ}
                    doAnnotateMessage={indices_to_annotate.includes(idx)}
                    feedbackMode={feedbackMode}
                    onboardingAnswers={feedbackMode ? m.answers : null}
                    explanation={feedbackMode ? m.explanation : null}
                    speakerLabel={speaker}
                    onUserInputUpdate={() => null}
                    annotations={annotations} setAnnotations={setAnnotations}
                    lastAnnotatedTurn={lastAnnotatedTurn} setLastAnnotated={setLastAnnotated}
                    setDoAdjustScroll={setDoAdjustScroll}
                />
            </div>
        }
      )}
    </div>
  )
}

export function SideBySideRightTopPane({ datas, annotationQ, subtaskIndex,
                       annotations, setAnnotations, lastAnnotatedTurn, setLastAnnotated, indices_to_annotate,
                       setDoAdjustScroll, turnSpecs, feedbackMode, interactive, contentHeight}) {
  const dialogueIds = datas.map(data => data.dialogue_id);
  let data_turns = datas.map(data => data.turns);
  const rtpl = <RightTopPane key={'right-top-pane-l'} scrollPaneName={'right-top-pane-l'} height={contentHeight} width='35%'>
      {
                data_turns.at(0).map(
                (m, idx) => {
                    let speaker;
                    if (interactive){
                        speaker = m.agent_idx === 0 ? 'You' : 'Partner';
                    } else {
                        speaker = ('speaker_label' in m) ? m.speaker_label : null;
                    }
                    return <div key={`${subtaskIndex}_${idx}_0`}>
                        <ChatMessage
                            class_spec={(turnSpecs !== undefined && turnSpecs.hasOwnProperty(idx)) ? turnSpecs[idx] : undefined}
                            dialogueId={dialogueIds.at(0)}
                            text={m.text}
                            agentIdx={m.agent_idx}
                            speakerLabel={speaker}
                            subtaskIdx={subtaskIndex}
                            turnIdx={idx}
                            annotationQ={annotationQ}
                            doAnnotateMessage={indices_to_annotate.includes(idx)}
                            feedbackMode={feedbackMode}
                            onboardingAnswers={feedbackMode ? m.answers : null}
                            explanation={feedbackMode ? m.explanation : null}
                            onUserInputUpdate={() => null}
                            annotations={annotations} setAnnotations={setAnnotations}
                            lastAnnotatedTurn={lastAnnotatedTurn} setLastAnnotated={setLastAnnotated}
                            setDoAdjustScroll={setDoAdjustScroll}
                        />
                    </div>
                }
              )
            }
  </RightTopPane>;

  const rtpr = <RightTopPane key={'right-top-pane-r'} scrollPaneName={'right-top-pane-r'} height={contentHeight} width='35%'>
      {
                data_turns.at(1).map(
                (m, idx) => {
                    let speaker;
                    if (interactive){
                        speaker = m.agent_idx === 0 ? 'You' : 'Partner';
                    } else {
                        speaker = ('speaker_label' in m) ? m.speaker_label : null;
                    }
                    return <div key={`${subtaskIndex}_${idx}_0`}>
                        <ChatMessage
                            class_spec={(turnSpecs !== undefined && turnSpecs.hasOwnProperty(idx)) ? turnSpecs[idx] : undefined}
                            dialogueId={dialogueIds.at(0)}
                            text={m.text}
                            agentIdx={m.agent_idx}
                            speakerLabel={speaker}
                            subtaskIdx={subtaskIndex}
                            turnIdx={idx}
                            annotationQ={annotationQ}
                            doAnnotateMessage={indices_to_annotate.includes(idx)}
                            feedbackMode={feedbackMode}
                            onboardingAnswers={feedbackMode ? m.answers : null}
                            explanation={feedbackMode ? m.explanation : null}
                            onUserInputUpdate={() => null}
                            annotations={annotations} setAnnotations={setAnnotations}
                            lastAnnotatedTurn={lastAnnotatedTurn} setLastAnnotated={setLastAnnotated}
                            setDoAdjustScroll={setDoAdjustScroll}
                        />
                    </div>
                }
              )
            }
  </RightTopPane>;

    return [rtpr, rtpl]; // have to return in reverse order because of float: right container parameter
}