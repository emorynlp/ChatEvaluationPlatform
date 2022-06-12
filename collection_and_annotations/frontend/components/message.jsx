/*
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from "react";

import {Multiselect} from "./multiselect.jsx";
import {pairs, selectCorrectAnswerToShow} from "./utils.jsx";
import {SingleSelect} from "./single_select.jsx";
import {ErrorBoundary} from "./error_boundary.jsx";
import {get_annotation_elements} from "./dynamic_annotation_flow.jsx";
import {TurnLikertScale} from './turn_likert_scale.jsx';

function ChatMessage({ class_spec, dialogueId, text, agentIdx, annotationQ, subtaskIdx, turnIdx, doAnnotateMessage,
                       feedbackMode, onboardingAnswers, explanation, speakerLabel, onUserInputUpdate, annotations, setAnnotations,
                       lastAnnotatedTurn, setLastAnnotated, setDoAdjustScroll}) {

  var extraElements = '';
  if (speakerLabel == null) {
    speakerLabel = agentIdx === 0 ? '(Sam)' : '(Alex)'
  }
  var speakerElements = (
    <div>
      <span style={{fontSize: "16px", color: "black"}}><b>{speakerLabel} </b> {text}</span>
    </div>
  )

  if (doAnnotateMessage) {
    let strid = `${dialogueId}_${subtaskIdx}_${turnIdx}`;
    let correct_strid = `c_${dialogueId}_${subtaskIdx}_${turnIdx}`;

    onboardingAnswers = selectCorrectAnswerToShow(onboardingAnswers);

    switch(annotationQ.config) {

      case "button_flow":
        const indexing_type = annotationQ.indices;
        let to_display = get_annotation_elements(strid, subtaskIdx, turnIdx, annotationQ.options, text, agentIdx,
                                                annotations, setAnnotations, setLastAnnotated, setDoAdjustScroll, true);
        let correct_button_selections_display = '';
        if (onboardingAnswers){ // format answers to display as annotation selections correctly
          const formattedOnboardingAnswers = {
            [subtaskIdx]: {
              "data": {
                [turnIdx]: onboardingAnswers
              }
            }
          }
          correct_button_selections_display = get_annotation_elements(correct_strid, subtaskIdx, turnIdx, annotationQ.options, text, agentIdx,
              formattedOnboardingAnswers, setAnnotations, setLastAnnotated, setDoAdjustScroll, true, 0, false);
        }

        if (turnIdx === lastAnnotatedTurn ||
            (!feedbackMode &&
              (
                  (indexing_type.includes("all") && turnIdx - 1 === lastAnnotatedTurn) ||
                  (['even', 'odd'].includes(indexing_type) && turnIdx - 2 === lastAnnotatedTurn)
              )
            )
        ){
          extraElements = (
              <>
                <br/>
                {onboardingAnswers ? (<p className="feedback-header">Your selection: </p>) : ''}
                <details open key={`extra_bf_` + turnIdx}>
                  <summary>Questions</summary>
                    <span>
                      {to_display}
                    </span>
                </details>
                {onboardingAnswers ?
                    (
                        <div>
                          <br/>
                          <p className="feedback-header">Explanation: </p>
                          <p>{explanation}</p>
                          <details>
                            <summary className="feedback-header">correct selection: </summary>
                              <span className="feedback-str">
                                {correct_button_selections_display}
                              </span>
                          </details>
                        </div>
                    )
                    : '' }
              </>
          )
        }
        else{
          extraElements = (
              <>
                <details key={`extra_bf_` + turnIdx}>
                <summary>Questions</summary>
                  <span>
                    {to_display}
                  </span>
              </details>
              </>
          )
        }

        break;
      case "nondetails_button_flow":

        let to_nondetail_display = get_annotation_elements(strid, subtaskIdx, turnIdx, annotationQ.options, text, agentIdx,
                                                annotations, setAnnotations, setLastAnnotated, setDoAdjustScroll, true);
        let correct_nondetails_selections_display = '';
        if (onboardingAnswers){ // format answers to display as annotation selections correctly
          const formattedOnboardingAnswers = {
            [subtaskIdx]: {
              "data": {
                [turnIdx]: onboardingAnswers
              }
            }
          }
          correct_nondetails_selections_display = get_annotation_elements(correct_strid, subtaskIdx, turnIdx, annotationQ.options, text, agentIdx,
              formattedOnboardingAnswers, setAnnotations, setLastAnnotated, setDoAdjustScroll, true, 0, false);
        }

        extraElements = (<>
          <span>
            <br/>
            {onboardingAnswers ? (<p className="feedback-header">Your selection: </p>) : ''}
            {to_nondetail_display}
            {onboardingAnswers ?
              (
                  <div>
                    <br/>
                    <p className="feedback-header">Explanation: </p>
                    <p>{explanation}</p>
                    <details>
                      <summary className="feedback-header">correct selection: </summary>
                      <span className="feedback-str">{correct_nondetails_selections_display}</span>
                    </details>
                    <br/>
                  </div>
              )
              : '' }
          </span>
        </>)

        break;

      case "nondetails_nonhelp_button_flow":

        let to_nondetail_nonhelp_display = get_annotation_elements(strid, subtaskIdx, turnIdx, annotationQ.options, text, agentIdx,
                                                annotations, setAnnotations, setLastAnnotated, setDoAdjustScroll, false);
        let correct_selections_display = '';
        if (onboardingAnswers){ // format answers to display as annotation selections correctly
          const formattedOnboardingAnswers = {
            [subtaskIdx]: {
              "data": {
                [turnIdx]: onboardingAnswers
              }
            }
          }
          correct_selections_display = get_annotation_elements(correct_strid, subtaskIdx, turnIdx, annotationQ.options, text, agentIdx,
              formattedOnboardingAnswers, setAnnotations, setLastAnnotated, setDoAdjustScroll, false, 0, false);
        }

        extraElements = (<>
          <span>
            <br/>
            {onboardingAnswers ? (<p className="feedback-header">Your selection: </p>) : ''}
            {to_nondetail_nonhelp_display}
            {onboardingAnswers ?
              (
                  <div>
                    <br/>
                    <p className="feedback-header">Explanation: </p>
                    <p>{explanation}</p>
                    <details>
                      <summary className="feedback-header">correct selection: </summary>
                      <span className="feedback-str">{correct_selections_display}</span>
                    </details>
                  </div>
              )
              : '' }
          </span>
        </>)

        break;

      case "multiselect":

        let formattedOnboardingAnswers;
        if (onboardingAnswers){ // format answers to display as annotation selections correctly
          formattedOnboardingAnswers = {
            [subtaskIdx]: {
              "data": {
                [turnIdx]: onboardingAnswers
              }
            }
          }
        }

        extraElements = (<span key={`extra_ms_` + turnIdx}><br />
          <span>
            <br/>
            {onboardingAnswers ? (<p className="feedback-header">Your selection: </p>) : ''}
            <span className="feedback-str">{annotationQ.question}</span>
            <Multiselect strid={strid} subtaskIdx={subtaskIdx} turnIdx={turnIdx} text={text} agentIdx={agentIdx}
                         annotationBuckets={annotationQ.options} task_title={annotationQ.task_title} onUserInputUpdate={onUserInputUpdate}
                         annotations={annotations} setAnnotations={setAnnotations}/>
            {onboardingAnswers ?
              (
                  <div>
                    <br/>
                    <p className="feedback-header">Explanation: </p>
                    <p>{explanation}</p>
                    <details>
                      <summary className="feedback-header">correct selection: </summary>
                      <span className="feedback-str">{annotationQ.question}</span>
                      <Multiselect strid={correct_strid} subtaskIdx={subtaskIdx} turnIdx={turnIdx} text={text} agentIdx={agentIdx}
                         annotationBuckets={annotationQ.options} task_title={annotationQ.task_title} onUserInputUpdate={onUserInputUpdate}
                         annotations={formattedOnboardingAnswers} setAnnotations={setAnnotations} enabled={false}/>
                    </details>
                    <br/>
                  </div>
              )
              : '' }
          </span>
        </span>)

        break;

      case "likert-5-turn":

        extraElements = (<span key={'extra_f5s_' + turnIdx}>
          <span>
            <br/>
            <span dangerouslySetInnerHTML={{ __html: annotationQ.question }}/>
            <TurnLikertScale annotationQ={annotationQ} text={text} agentIdx={agentIdx} subtaskIdx={subtaskIdx} turnIdx={turnIdx} annotations={annotations} setAnnotations={setAnnotations}/>
          </span>
        </span>)
        break;
      default:
        break;
    }
  }

  return (
    <div className="row" style={{ marginLeft: "0", marginRight: "0" }}>
      <div className={class_spec === undefined ? `alert ${agentIdx === 0 ? "alert-info" : "alert-success"}` : class_spec}
           style={{
             float: `${agentIdx === 0 ? "right" : "left"}`,
             // display: 'table',
             width: `${agentIdx === 0 ? "80%" : "80%"}`,
           }}
                    // marginTop: "auto" }}
          id={`chat_message_${subtaskIdx}_${turnIdx}`}>
        <span>
          {speakerElements}
          <ErrorBoundary>
            {extraElements}
          </ErrorBoundary>
        </span>
      </div>
    </div>
  )
}

function RenderChatMessage({ message, mephistoContext, appContext, idx }) {
  const { agentId, taskConfig } = mephistoContext;
  const { currentAgentNames } = appContext.taskContext;
  const { annotations, setAnnotations, modelIdx } = appContext;
  const isHuman = (message.id === agentId || message.id == currentAgentNames[agentId]);

  let annotationTask = null;
  if (taskConfig.do_interactive_online_annotations !== "") {
    annotationTask = taskConfig.annotation_buckets.config[taskConfig.do_interactive_online_annotations]
  }

  const doAnnotateMessage = !isHuman && annotationTask !== null;

  return (<ChatMessage
    text={message.text}
    agentIdx={isHuman ? 0 : 1}
    subtaskIdx={modelIdx}
    turnIdx={idx}
    annotationQ={annotationTask}
    doAnnotateMessage={doAnnotateMessage}
    speakerLabel={message.id in currentAgentNames ? currentAgentNames[message.id] : message.id}
    annotations={annotations} setAnnotations={setAnnotations}
  />);

}

export { RenderChatMessage, ChatMessage };