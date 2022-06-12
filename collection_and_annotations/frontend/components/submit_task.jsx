import React from "react";

export function SubmitTaskPage({submitted, setSubmitted, handleSubmit, state, annotations, destroy}){
    console.log('completed...');
    if (!submitted){
        setSubmitted(2);
    }
    if (submitted === 2) {
        // Everything successfully submitted!
        return (
          <div style={{margin: 0, padding: 0, height: '100%', textAlign: 'center'}}>
              <h2>Your Progress: Submitted </h2>
              <br/>
              <p className="onboarding-description">
                  Your results are submitted!
              </p>
          </div>
        );
    }
    return (
      <div style={{margin: 0, padding: 0, height: '100%', textAlign: 'center'}}>
          <h2>Your Progress: Processing Results </h2>
          <br/>
          <p className="onboarding-description">
              Your results are being processed. When the Finish button is enabled below, press it to submit your assignment!
              <br/>
              Do not close without pressing Finish or your results will not be submitted!
          </p>
          <br/>
          <button id="submit-button" className="button is-link" disabled={!state.task_done}
                  onClick={() => {
                    console.log('submitted!');
                    handleSubmit({'annotations': JSON.stringify(annotations), "completed": true});
                    setSubmitted(2);
                    destroy();
                  }}>
              {state.task_done ? "Finish" : "Processing..." }
          </button>
      </div>
    );
}