/*
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from "react";
import { AnnotationComponent } from "./annotation_components.jsx";


function MainApp({taskData, prevData, mephistoProps, isScreen, annotations, setAnnotations, index, setIndex, annot, setAnnot, setSubmitted, submitted, modelIdx, setModelIdx, setChatDone, interactive}) {

  if (mephistoProps?.isLoading) {
    return <div><p> Loading...</p></div>;
  }

  return (
    <div style={{ margin:0, padding:0, height:'100%' }}>
      <AnnotationComponent
        taskData={taskData}
        prevData={prevData}
        mephistoProps={mephistoProps} isScreen={isScreen}
        annotations = {annotations}
        setAnnotations={setAnnotations}
        index={index} setIndex={setIndex}
        annot={annot} setAnnot={setAnnot}
        setSubmitted={setSubmitted} submitted={submitted}
        modelIdx={modelIdx} setModelIdx={setModelIdx}
        setChatDone={setChatDone}
        interactive={interactive}
      />
    </div>
  );
}

export { MainApp as AnnotationApp };
