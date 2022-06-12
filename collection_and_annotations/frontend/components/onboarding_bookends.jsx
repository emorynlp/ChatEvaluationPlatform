import React from "react";

export function OnboardingWelcome({setStartupPage}){
      return (
      <div style={{ margin: 0, padding: 0, height: '100%', textAlign: 'center'}}>
          <h2>Welcome to the training session for the Dialogue Behavior Analysis assignment!</h2>
          <br/>
          <p className="onboarding-description">
              You will be taken through a series of training activities where you will learn how to be
              successful at the tasks in the Dialogue Behavior analysis assignment.
              <br/><br/>
              Your performance on the training activities will be calculated, so it is important for
              you to take your time and do your best.
              <br/><br/>
              You will receive feedback as you finish each task in order to correct any mistakes you make.
              <br/><br/>
              Your progress will be saved each time you complete a task or a feedback round.
              <br/><br/>
              Click <b>[Begin]</b> when you are ready to start!
          </p>
          <br/><br/>
          <div style={{ textAlign: 'center' }}>
              <button id="ow-submit-button"
                className="button is-link"
                onClick={() => {setStartupPage("task");}}
                >
                Begin
              </button>
          </div>
      </div>
  )
}

export function renameTaskTitle(taskTitle){
   const rename = {
        'grammar': 'Interpretability',
        'consistency_label': 'Consistency',
        'sociality': 'Antisocial',
        'transitions': 'Transitions',
        'commonsense': 'Common Knowledge',
        'knowledge': 'Knowledge',
        'empathy': 'Empathy',
        'personal_information': 'Personal Information'
    };
    return rename[taskTitle];
}

export function OnboardingInit({taskTitle, startupPageNum, setStartupPage}) {
    taskTitle = renameTaskTitle(taskTitle);
    return (
      <div style={{ margin: 0, padding: 0, height: '100%', textAlign: 'center'}}>
          <h1>Training</h1>
          <br/>
          <p className="onboarding-description">
              This task involves labeling conversations between a human and chatbot.
              <br/><br/>
              To start out, you will complete 3 training conversations with feedback.
              <br/><br/>
              The <b>3rd training conversation is graded</b> and determines whether you will be allowed to continue, so do your best to learn from the provided instructions and feedback.
          </p>
          <br/><br/>
          <div style={{ textAlign: 'center' }}>
              <button id="submit-button"
                className="button is-link"
                onClick={() => {setStartupPage(false);}}>
                Begin {taskTitle}
              </button>
          </div>
      </div>
  )
}

export function FeedbackInit({taskTitle, numMistakes, passCriteria, setStartupPage}) {
    taskTitle = renameTaskTitle(taskTitle);
    return (
      <div style={{ margin: 0, padding: 0, height: '100%', textAlign: 'center'}}>
          <h1>Feedback</h1>
          <br/>
          <p className="onboarding-description">
              You made {numMistakes} mistakes on the last {taskTitle} training round. Your goal is to make no more than 1 mistake per training round.
              <br/><br/>
              Your next task is to review your incorrect answers and correct them.
              <br/><br/>
              You will be shown your incorrect answers one at a time in red, and explanations will be provided for the correct selections.
          </p>
          <br/><br/>
          <div style={{ textAlign: 'center' }}>
              <button id="submit-button"
                className="button is-link"
                onClick={() => {setStartupPage(false);}}>
                Review {taskTitle}
              </button>
          </div>
      </div>
  )
}

export function OnboardingFin({title, onClick, progressMessage}) {
    return (
          <div style={{ margin: 0, padding: 0, height: '100%', textAlign: 'center'}}>
              <h1>{title}</h1>
              <br/>
              <p className="onboarding-description">
                  {progressMessage}
              </p>
              <br/><br/>
              <div style={{ textAlign: 'center' }}>
                  <button id="submit-button"
                    className="button is-link"
                    onClick={onClick}
                  >
                    Okay
                  </button>
              </div>
          </div>
      )
}