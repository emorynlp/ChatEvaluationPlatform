/*
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

// Copies code directly from `bootstrap-chat` in order to make a chat app

import React from "react";

import {
  MephistoContext,
  useMephistoLiveTask,
  AGENT_STATUS,
} from "mephisto-task";
import { BaseFrontend, AppContext } from "bootstrap-chat";

/* ================= Application Components ================= */

const INPUT_MODE = {
  WAITING: "waiting",
  INACTIVE: "inactive",
  DONE: "done",
  READY_FOR_INPUT: "ready_for_input",
};

function CustomChatApp({
    mephistoProps,
    messages, addMessage, modelIdx, setModelIdx,
    annotations, setAnnotations,
    renderMessage,
    renderSidePane,
    renderTextResponse,
    renderResponse,
    onMessagesChange,
    setAppSettings,
    inputMode, setInputMode,
    taskContext, appSettings
}) {


  // React.useEffect(() => {
  //   sendMessage({
  //     packet_type: "annotations",
  //     data: annotations
  //   })
  // }, [annotations]);

  let {
    blockedReason,
    blockedExplanation,
    taskConfig,
    isPreview,
    previewHtml,
    isLoading,
    agentId,
    handleSubmit,
    connect,
    destroy,
    sendMessage,
    isOnboarding,
    agentState,
    agentStatus,
  } = mephistoProps;

  const handleMessageSend = React.useCallback(
    (message) => {
      message = {
        ...message,
        id: agentId,
        episode_done: agentState?.task_done || false,
        agent_idx: 0
      };
      return sendMessage(message)
        .then(addMessage)
        .then(() => setInputMode(INPUT_MODE.WAITING));
    },
    [agentId, agentState?.task_done, addMessage, setInputMode]
  );

  if (blockedReason !== null) {
    return <h1>{blockedExplanation}</h1>;
  }
  if (isLoading) {
    return <div>Initializing...</div>;
  }
  if (isPreview) {
    if (!taskConfig.has_preview) {
      return <TaskPreviewView description={taskConfig.task_description} />;
    }
    if (previewHtml === null) {
      return <div>Loading...</div>;
    }
    return <div dangerouslySetInnerHTML={{ __html: previewHtml }} />;
  }

  return (
    <MephistoContext.Provider value={mephistoProps}>
      <AppContext.Provider
        value={{
          taskContext,
          annotations, setAnnotations, modelIdx,
          appSettings,
          setAppSettings,
          onTaskComplete: () => {
            destroy();
            handleSubmit({});
          },
        }}
      >
        <div className="container-fluid" id="ui-container"
             style={{ display: "block", overflow: "scroll", height:'100%', width:'100%' }}>
          <BaseFrontend
            inputMode={inputMode}
            messages={messages === undefined ? [] : messages.turns}
            onMessageSend={handleMessageSend}
            renderMessage={renderMessage}
            renderSidePane={renderSidePane}
            renderTextResponse={renderTextResponse}
            renderResponse={renderResponse}
          />
        </div>
      </AppContext.Provider>
    </MephistoContext.Provider>
  );
}

function TaskPreviewView({ description }) {
  return (
    <div className="preview-screen">
      <div
        dangerouslySetInnerHTML={{
          __html: description,
        }}
      />
    </div>
  );
}

export { CustomChatApp, AppContext, INPUT_MODE };