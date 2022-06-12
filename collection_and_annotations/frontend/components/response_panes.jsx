/*
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from "react";

import { 
  FormControl, 
  Button,
  Col,
  FormGroup,
  ControlLabel,
} from "react-bootstrap";


function SubmittableTextResponse({ taskConfig, onMessageSend, active, currentCheckboxes, chatModel}) {

  const [textValue, setTextValue] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const inputRef = React.useRef();

  React.useEffect(() => {
    if (active && inputRef.current && inputRef.current.focus) {
      inputRef.current.focus();
    }
  }, [active]);

  const tryDoneMessageSend = React.useCallback(() => {
    if (active && !sending) {
      setSending(true);
      onMessageSend({
        text: "END",
        packet_type: "end_dialogue",
        botmodel: chatModel
      }).then(() => {
        setSending(false);
      });
    }
  }, [active, sending, onMessageSend]);

    const tryResponseMessageSend = React.useCallback(() => {
    if (textValue !== "" && active && !sending) {
      setSending(true);
      onMessageSend({
        text: textValue,
        botmodel: chatModel
      }).then(() => {
        setTextValue("");
        setSending(false);
        if (active && inputRef.current && inputRef.current.focus) {
          inputRef.current.focus();
        }
      });
    }
  }, [textValue, active, sending, onMessageSend]);

  const handleKeyPress = React.useCallback(
    (e) => {
      if (e.key === "Enter") {
        tryResponseMessageSend();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }
    },
    [tryResponseMessageSend]
  );

  return (
    <div className="response-type-module">
      <div className="response-bar">
        <FormControl
          type="text"
          className="response-text-input"
          inputRef={(ref) => {
            inputRef.current = ref;
          }}
          value={textValue}
          placeholder="You have reached the maximum turns. Please submit your conversation by clicking END!"
          onKeyPress={(e) => handleKeyPress(e)}
          onChange={(e) => setTextValue(e.target.value)}
          disabled={true}
        />
        {/*<Button*/}
        {/*  className="btn btn-primary submit-response"*/}
        {/*  id="id_send_msg_button"*/}
        {/*  disabled={textValue === "" || !active || sending}*/}
        {/*  onClick={() => tryResponseMessageSend()}*/}
        {/*>*/}
        {/*  Send*/}
        {/*</Button>*/}
        <Button
          className="btn btn-danger submit-response"
          id="id_send_msg_button"
          disabled={!active || sending}
          onClick={() => tryDoneMessageSend()}
        >
          END
        </Button>
      </div>
    </div>
  );
}


function ContinueTextResponse({ onMessageSend, active, currentCheckboxes, chatModel}) {

  const [textValue, setTextValue] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const inputRef = React.useRef();

  React.useEffect(() => {
    if (active && inputRef.current && inputRef.current.focus) {
      inputRef.current.focus();
    }
  }, [active]);

  const tryMessageSend = React.useCallback(() => {
    if (textValue !== "" && active && !sending) {
      setSending(true);
      onMessageSend({ 
        text: textValue,
        botmodel: chatModel
      }).then(() => {
        setTextValue("");
        setSending(false);
        if (active && inputRef.current && inputRef.current.focus) {
          inputRef.current.focus();
        }
      });
    }
  }, [textValue, active, sending, onMessageSend]);

  const handleKeyPress = React.useCallback(
    (e) => {
      if (e.key === "Enter") {
        tryMessageSend();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }
    },
    [tryMessageSend]
  );

  return (
    <div className="response-type-module">
      <div className="response-bar">
        <FormControl
          type="text"
          className="response-text-input"
          inputRef={(ref) => {
            inputRef.current = ref;
          }}
          value={textValue}
          placeholder="Please enter here..."
          onKeyPress={(e) => handleKeyPress(e)}
          onChange={(e) => setTextValue(e.target.value)}
          disabled={!active || sending}
        />
        <Button
          className="btn btn-primary submit-response"
          id="id_send_msg_button"
          disabled={textValue === "" || !active || sending}
          onClick={() => tryMessageSend()}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

function hasAnyAnnotations(annotations, taskConfig) {
  if (taskConfig.do_interactive_online_annotations.includes('_optional')){
    return true;
  }
  else if (!annotations) {
    return false;
  }
  else if (`${taskConfig.do_interactive_online_annotations}_labels` in annotations && annotations[`${taskConfig.do_interactive_online_annotations}_labels`].length > 0){
    return true;
  }
  return false;
}

function ResponseComponent({ taskConfig, chatModel, appSettings, annotations, modelIdx, onMessageSend, active }) {
  const lastMessageIdx = appSettings.numMessages - 1;

  let lastMessageAnnotations = null;
  if (modelIdx in annotations && 'data' in annotations[modelIdx] && lastMessageIdx in annotations[modelIdx]['data']){
    lastMessageAnnotations = annotations[modelIdx]['data'][lastMessageIdx];
  }

  const computedActive = (
      (!taskConfig.do_interactive_online_annotations || hasAnyAnnotations(lastMessageAnnotations, taskConfig))
      & active
  );

  if (lastMessageIdx >= taskConfig.min_num_turns - 1) {
    return (
      <SubmittableTextResponse
        onMessageSend={onMessageSend}
        taskConfig={taskConfig}
        active={computedActive}
        chatModel={chatModel}
      />
    );
  } else {
    return (
      <ContinueTextResponse
        onMessageSend={onMessageSend}
        active={computedActive}
        chatModel={chatModel}
      />
    );
  }
}

export { ResponseComponent };