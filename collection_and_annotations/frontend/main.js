/*
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from "react";
import ReactDOM from "react-dom";
import "bootstrap-chat/styles.css";
import './css/style.css';
import {useMephistoTask, useMephistoLiveTask, AGENT_STATUS} from "mephisto-task";

import { CustomChatApp, INPUT_MODE } from "./components/chat_app.jsx"
import { DefaultTaskDescription } from "bootstrap-chat";
import { ResponseComponent } from "./components/response_panes.jsx";
import { RenderChatMessage } from "./components/message.jsx";
import { AnnotationApp } from './components/annotation_app.jsx'
import {isSupportedBrowser, waitForInitTaskData} from "./components/utils.jsx";
import { checkConnection, simpleDisplay } from "./components/utils.jsx";

import { customSocket } from './components/custom_socket_handler.jsx';

import { ERRORS } from './components/custom_errors.jsx';

import { preview_dialogue } from './components/tasks/preview_dialogue.jsx';


function MainApp() {

  const [taskContext, updateContext] = React.useReducer(
    (oldContext, newContext) => Object.assign(oldContext, newContext),
    {}
  );

  const propAppSettings={checkboxValues: {}};

  const initialAppSettings = {
    ...propAppSettings,
    volume: 1,
    isReview: false,
    isCoverPage: false,
    numMessages: 0
  };
  const [appSettings, setAppSettings] = React.useReducer(
    (prevSettings, newSettings) => Object.assign({}, prevSettings, newSettings),
    initialAppSettings
  );
  const [inputMode, setInputMode] = React.useState(INPUT_MODE.WAITING);

  function playNotifSound() {
    let audio = new Audio("./notif.mp3");
    audio.volume = appSettings.volume;
    // audio.play();
  }

  function trackAgentName(agentName) {
    if (agentName) {
      const previouslyTrackedNames = taskContext.currentAgentNames || {};
      const newAgentName = { [agentId]: agentName };
      const currentAgentNames = { ...previouslyTrackedNames, ...newAgentName };
      updateContext({ currentAgentNames: currentAgentNames });
    }
  }

  let mephistoProps = useMephistoLiveTask({
      customConnectionHook: customSocket,
    onStateUpdate: ({ state, status }) => {
      trackAgentName(state.agent_display_name);
      if (state?.chat_done) {
        setChatDone(true);
        setInputMode(INPUT_MODE.INACTIVE);
      }
      else {
        setChatDone(false);
        setInputMode(INPUT_MODE.WAITING);
      }
      if (state.task_done) {
        setInputMode(INPUT_MODE.DONE);
      } else if (
        [
          AGENT_STATUS.DISCONNECT,
          AGENT_STATUS.RETURNED,
          AGENT_STATUS.EXPIRED,
          AGENT_STATUS.TIMEOUT,
          AGENT_STATUS.MEPHISTO_DISCONNECT,
        ].includes(status)
      ) {
        setInputMode(INPUT_MODE.INACTIVE);
      } else if (state.wants_act) {
        setInputMode(INPUT_MODE.READY_FOR_INPUT);
        playNotifSound();
      }
    },
    onMessageReceived: (message) => {
      // delete message.beam_texts;
      addMessage(message);
    },
  });

    const taskConfig = mephistoProps.taskConfig;
    const initialTaskData = mephistoProps.initialTaskData;
    const workerId = mephistoProps.providerWorkerId;
    const agentId = mephistoProps.agentId;

    React.useEffect(() => {
        if (agentId) {
          console.log("connecting...");
          mephistoProps.connect(mephistoProps.agentId);
          setSubmitted(false);
        }
      }, [mephistoProps.agentId]);

    // ** universal state variables
    const [annotations, setAnnotations] = React.useState({'workerId': workerId});
    const [onboardingAnnotations, setOnboardingAnnotations] = React.useState({'workerId': workerId});
    const [submitted, setSubmitted] = React.useState(false);
    const [disconnected, setDisconnected] = React.useState(false);

    // React.useEffect(()=>{console.log('annotations: '); console.log(annotations)}, [annotations]);

    // ** annotation state variables
    const [index, setIndex] = React.useState(0);
    const [annot, setAnnot] = React.useState(0);
    const [onboardingIndex, setOnboardingIndex] = React.useState(0);
    const [onboardingAnnot, setOnboardingAnnot] = React.useState(0);

    // ** model chat state variables
    const [chatDone, setChatDone] = React.useState(false);
    const [modelIdx, setModelIdx] = React.useState(0);
    const [chatModels, addChatModel] = React.useReducer((previous, current) => {
        if (previous.length > 0) {
            if (previous.at(-1) !== current) {
                return [...previous, current];
            } else {
                return previous;
            }
        } else {
            return [current];
        }
    }, [])

    const [messages, addMessage] = React.useReducer((previousMessages, newMessage) => {
        let modelname = chatModels.length > 0 ? chatModels.at(-1) : undefined;
        if (newMessage.botmodel !== modelname) {
            modelname = newMessage.botmodel;
            addChatModel(modelname);
        }
        let messageData = modelname in previousMessages ? previousMessages[modelname] : {"turns": []};
        // todo - what does this mean? "we clear messages by sending false"
        const results = newMessage === false ? [] : {...previousMessages,
                                                [modelname]: {...messageData,
                                                            "turns": [...messageData.turns, newMessage]}};
        setAppSettings({ numMessages: results[modelname].turns.length });
        return results;
      },
        {}
    );

    // for onboarding previous data loading
    const [initTaskData, setInitTaskData] = React.useState(null);
    if (mephistoProps?.agentId && initTaskData === null) {
        waitForInitTaskData(mephistoProps.mephistoWorkerId, mephistoProps.agentId).then((response) => {
            setInitTaskData(response);
        });
    }

    let display;

    const [prevLoaded, setPrevLoaded] = React.useState(false);
    const [startupPage, setStartupPage] = React.useState(true); // records whether initial startup page has been displayed for chatting

    // console.log(mephistoProps);

    if (mephistoProps.isPreview && taskConfig?.do_external_annotations){
        const task_preview_map = {
            'interpretability': ['grammar'],
            'likert': ["grammatical_likert", "relevant_likert", "informative_likert", "emotion_likert", "engaging_likert", "consistent_likert", "proactive_likert", "quality_likert"],
            'likert_turn': ['quality_likert_turn'],
            'comparative': ["grammatical_comparative", "relevant_comparative", "informative_comparative", "emotion_comparative", "engaging_comparative", "consistent_comparative", "proactive_comparative", "quality_comparative"],
            'consistency': ['consistency_label']
        }
        let tn = taskConfig.taskname.replaceAll('_local', '').replaceAll('_sandbox', '');
        if (task_preview_map.hasOwnProperty(tn)) {
            tn = task_preview_map[tn]
        }
        else {
            tn = [tn];
        }
        preview_dialogue['preview_dialogue']['annotation_tasks'] = tn;
        console.log(preview_dialogue);
        display = <AnnotationApp taskData={preview_dialogue} prevData={initTaskData?.prev_data} mephistoProps={mephistoProps}
              annotations={onboardingAnnotations} setAnnotations={setOnboardingAnnotations}
              index={onboardingIndex} setIndex={setOnboardingIndex}
              annot={onboardingAnnot} setAnnot={setOnboardingAnnot}
                 setSubmitted={setSubmitted} submitted={submitted}/>;
    }

    if (ERRORS.hasOwnProperty(mephistoProps.agentId)) {
        return (
          <section className="hero is-medium is-danger">
            <div className="hero-body">
              <h2 className="title is-3">{ERRORS[mephistoProps.agentId]}</h2>{" "}
            </div>
          </section>
        );
    }

    if (!isSupportedBrowser()){
        return (
          <section className="hero is-medium is-danger">
            <div className="hero-body">
              <h2 className="title is-3">{ERRORS["browser"]}</h2>{" "}
            </div>
          </section>
        );
    }

    if (mephistoProps.blockedReason !== null) {
        // blocked reason exists from beginning and is permanent, so can be used to shortcut
        return (
          <section className="hero is-medium is-danger">
            <div className="hero-body">
              <h2 className="title is-3">{mephistoProps.blockedExplanation}</h2>{" "}
            </div>
          </section>
        );
      }

    if (mephistoProps.agentStatus === 'timeout') {
        return (
          <section className="hero is-medium is-danger">
            <div className="hero-body">
              <h2 className="title is-3">{ERRORS["timeout"]}</h2>{" "}
            </div>
          </section>
        );
    }

    if (taskConfig !== null && mephistoProps.agentId !== null && initTaskData !== null && initialTaskData !== null) {
        if (taskConfig.do_collect_dialogue && taskConfig.do_interactive_offline_annotations.length > 0) {
            let formattedMessages = messages;
            let loadedChatModels = chatModels;
            if (!prevLoaded && initialTaskData?.prev_data.hasOwnProperty("final_chat_data")) { // checking for previous data (applicable on refresh, reload, etc.)
                setPrevLoaded(true);
                formattedMessages = initialTaskData.prev_data.final_chat_data.dialog;
                loadedChatModels = initialTaskData.prev_data.final_chat_data.chatModels;
                for (const model of loadedChatModels){
                    const savedData = formattedMessages[model];
                    for (const t of savedData){
                        addMessage(t);
                    }
                }
                setStartupPage(false);
                if (!chatDone) { // if final_chat_data in prev_data, then chatting has concluded, but only set chatDone once to avoid infinite rerenders
                    setChatDone(true);
                }
            }

            // add annotation_tasks key to taskData for each task that has annotation tasks according to do_interactive_offline_annotations
            let idx = 0;
            for (const tasks of initialTaskData.do_interactive_offline_annotations_randomized){
                if (formattedMessages.hasOwnProperty(chatModels[idx])) {
                    formattedMessages[chatModels[idx]]["annotation_tasks"] = tasks;
                }
                idx += 1;
            }

            if (startupPage){
                display = chatStart(taskConfig.chat_startup_instructions, setStartupPage);
            } else{
                display = !chatDone ? <ChatApp mephistoProps={mephistoProps} chatModel={chatModels.at(-1)}
                            messages={messages[chatModels.at(-1)]} addMessage={addMessage}
                            modelIdx={modelIdx} setModelIdx={setModelIdx}
                            annotations={annotations} setAnnotations={setAnnotations}
                            setAppSettings={setAppSettings} inputMode={inputMode} setInputMode={setInputMode}
                            taskContext={taskContext} appSettings={appSettings}
                        />
                :
                <AnnotationApp taskData={formattedMessages} prevData={initialTaskData.prev_data} mephistoProps={mephistoProps}
                               annotations={annotations} setAnnotations={setAnnotations}
                               index={index} setIndex={setIndex}
                               annot={annot} setAnnot={setAnnot} setSubmitted={setSubmitted} submitted={submitted}
                                modelIdx={modelIdx} setModelIdx={setModelIdx}
                                setChatDone={setChatDone} interactive={true}/>;
            }
        }
        else if (taskConfig.do_collect_dialogue) {
            display = !chatDone ? <ChatApp mephistoProps={mephistoProps} chatModel={chatModels.at(-1)}
                            messages={messages[chatModels.at(-1)]} addMessage={addMessage}
                            modelIdx={modelIdx} setModelIdx={setModelIdx}
                            annotations={annotations} setAnnotations={setAnnotations}
                            setAppSettings={setAppSettings} inputMode={inputMode} setInputMode={setInputMode}
                            taskContext={taskContext} appSettings={appSettings}
                        />
                :
                <div style={{ margin: 0, padding: 0, height: '100%', textAlign: 'center'}}>
                  <h2>Your Progress: Completed</h2>
                  <br/>
                  <p className="onboarding-description">
                      You have finished! Thank you for completing this assignment!
                  </p>
              </div>
        }
        else if (taskConfig.do_external_annotations) {
            if (initialTaskData !== null) {
                let formattedData;
                if (mephistoProps.isOnboarding) {
                    formattedData = mephistoProps.taskConfig.onboarding_data;
                    display = <AnnotationApp taskData={formattedData} prevData={initTaskData?.prev_data}
                                             mephistoProps={mephistoProps}
                                             annotations={onboardingAnnotations}
                                             setAnnotations={setOnboardingAnnotations}
                                             index={onboardingIndex} setIndex={setOnboardingIndex}
                                             annot={onboardingAnnot} setAnnot={setOnboardingAnnot}
                                             setSubmitted={setSubmitted} submitted={submitted}/>;
                } else {
                    let is_screen;
                    if (initialTaskData.task_data[0]?.is_screen){
                        formattedData = Object.fromEntries(Object.entries(initialTaskData.task_data[0]).filter(item => item[0] !== 'is_screen'));
                        is_screen = true;
                    } else {
                        formattedData = Object.fromEntries(initialTaskData.task_data.map(dialogue => [dialogue.dialogue_id, {...dialogue}]));
                        is_screen = false;
                    }
                    mephistoProps.isOnboarding = is_screen ? is_screen : mephistoProps.isOnboarding;
                    display = <AnnotationApp taskData={formattedData} prevData={initialTaskData.prev_data}
                                             mephistoProps={mephistoProps} isScreen={is_screen}
                                             annotations={annotations} setAnnotations={setAnnotations}
                                             index={index} setIndex={setIndex}
                                             annot={annot} setAnnot={setAnnot}
                                             setSubmitted={setSubmitted} submitted={submitted}/>;
                }
            }
        }

        else {
            console.log('ERROR IN TASK SPECIFICATION - NOT COLLECTING DIALOGUES AND ALSO NOT ANNOTATING EXTERNALLY!')
        }
    }

    if (display === undefined) {
        display = simpleDisplay({header: 'Initializing...'});
    }

    const connectionMessage = checkConnection(mephistoProps.connectionStatus, mephistoProps.agentState);
    if (mephistoProps.taskConfig && !submitted && connectionMessage) {
        if (!disconnected) {
            setDisconnected(true);
            mephistoProps.destroy();
            return simpleDisplay({header: 'Error', message: connectionMessage});
        } else {
            return simpleDisplay({header: 'Error', message: connectionMessage});
        }
    }

    return display;
}

function ChatApp({mephistoProps, chatModel, messages, addMessage, modelIdx, setModelIdx, annotations, setAnnotations, setAppSettings, inputMode, setInputMode, taskContext, appSettings }) {
    return (
        <CustomChatApp
        mephistoProps={mephistoProps}
        messages={messages} addMessage={addMessage}
        modelIdx={modelIdx} setModelIdx={setModelIdx}
        annotations={annotations} setAnnotations={setAnnotations}
        setAppSettings={setAppSettings} inputMode={inputMode} setInputMode={setInputMode}
        taskContext={taskContext} appSettings={appSettings}
        renderMessage={({message, idx, mephistoContext, appContext}) => (
            <RenderChatMessage
                message={message}
                mephistoContext={mephistoContext}
                appContext={appContext}
                idx={idx}
                key={message.message_id + "-" + idx}
            />
        )}
        renderSidePane={({mephistoContext: {taskConfig}, appContext: {taskContext}}) => (
            <DefaultTaskDescription
                chatTitle={taskConfig.chat_title}
                taskDescriptionHtml={taskConfig.left_pane_text}
            >
                {(taskContext.hasOwnProperty('image_src') && taskContext['image_src']) ? (
                    <div>
                        <h4>Conversation image:</h4>
                        <span id="image">
                <img src={taskContext.image_src} alt='Image'/>
              </span>
                        <br/>
                    </div>
                ) : null}
            </DefaultTaskDescription>
        )}
        renderTextResponse={
            ({
                 mephistoContext: {taskConfig},
                 appContext: {appSettings, annotations},
                 onMessageSend,
                 active,

             }) => (
                <ResponseComponent
                    appSettings={appSettings}
                    modelIdx={modelIdx}
                    chatModel={chatModel}
                    annotations={annotations}
                    taskConfig={taskConfig}
                    active={active}
                    onMessageSend={onMessageSend}
                />
            )
        }
    />
    )
}

function chatStart(instructions, setStartupPage){
    return (<div style={{ margin: 0, padding: 0, height: '100%', textAlign: 'center'}}>
        <div dangerouslySetInnerHTML={{
          __html: instructions || "Instructions Loading",
        }}/>
        <p className="onboarding-description">
              Click <b>[Begin]</b> when you are ready to start!
          </p>
          <br/><br/>
          <div style={{ textAlign: 'center' }}>
              <button id="ow-submit-button"
                className="button is-link"
                onClick={() => {setStartupPage(false);}}
                >
                Begin
              </button>
          </div>
      </div>)
}

ReactDOM.render(<MainApp />, document.getElementById("app"));