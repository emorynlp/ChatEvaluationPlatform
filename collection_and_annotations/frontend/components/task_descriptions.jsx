
import React from "react";

import { get_transitions_instructions } from "./task_descriptions/transitions_instructions.jsx";
import { get_transitions_help } from "./task_descriptions/transitions_help.jsx";
import { get_knowledge_help } from "./task_descriptions/knowledge_help.jsx";
import { get_common_knowledge_contradiction_examples } from "./task_descriptions/common_knowledge_contradiction_examples.jsx";
import { get_common_knowledge_contradiction_instructions } from "./task_descriptions/common_knowledge_contradiction_instructions.jsx";
import { get_interpretability_error_instructions } from "./task_descriptions/interpretability_error_instructions.jsx";
import {get_interpretability_error_examples} from "./task_descriptions/interpretability_error_examples.jsx";
import {get_antisocial_behaviors_instructions} from "./task_descriptions/antisocial_behaviors_instructions.jsx";
import {get_antisocial_behaviors_examples} from "./task_descriptions/antisocial_behaviors_examples.jsx";
import {get_consistency_examples} from "./task_descriptions/consistency_examples.jsx";
import {get_consistency_instructions} from "./task_descriptions/consistency_instructions.jsx";
import {get_empathy_examples} from "./task_descriptions/empathy_examples.jsx"
import { get_empathy_instructions } from "./task_descriptions/empathy_instructions.jsx";
import {get_personal_information_sharing_examples} from "./task_descriptions/personal_information_sharing_examples.jsx"
import { get_personal_information_sharing_instructions } from "./task_descriptions/personal_information_sharing_instructions.jsx";

export function getTaskDescription(task_title, speakerLabel='', otherLabel='') {
    switch(task_title) {
        case "dialogue_likert":
            return (
                <div className="task-description">
                    <b><h4>Dialogue Rating Task</h4></b>
                    <br/>
                    Your task is to rate speaker Alex in the displayed dialogue on 8 dimensions.<br/><br/>
                    Alex's performance is measured through consideration of all of their responses in the dialogue.<br/><br/>
                    Your ratings will be on a 5-point scale, with 5 representing a very high degree of fit and 1 representing a very low degree of fit.<br/><br/>
                    The 8 dimensions are:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td><b>Grammatical</b></td>
                                <td>Responses are free of grammatical and semantic errors.</td>
                            </tr>
                            <tr>
                                <td><b>Relevant</b></td>
                                <td>Responses are on-topic with the immediate dialogue history.</td>
                            </tr>
                            <tr>
                                <td><b>Informative</b></td>
                                <td>Responses produce unique and non-generic information that is specific to the dialogue context.</td>
                            </tr>
                            <tr>
                                <td><b>Emotion Aware</b></td>
                                <td>Responses indicate an understanding of the other speaker’s current emotional state and provide an appropriate emotional reaction based on the current dialogue context.</td>
                            </tr>
                            <tr>
                                <td><b>Engaging</b></td>
                                <td>Responses are engaging to the other speaker and fulfill the particular conversational goals implied by the other speaker.</td>
                            </tr>
                            <tr>
                                <td><b>Consistent</b></td>
                                <td>Responses do not produce information that contradicts other information known about the system.</td>
                            </tr>
                            <tr>
                                <td><b>Proactive</b></td>
                                <td>Responses actively and appropriately move the conversation along different topics.</td>
                            </tr>
                            <tr>
                                <td><b>Quality</b></td>
                                <td>The overall quality of and satisfaction with the responses.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                </div>
            )
        case "response_likert":
            return (
                <div className="task-description">
                    <b><h4>Response Rating Task</h4></b>
                    <br/>
                    Your task is to individually rate each of the responses given by Alex in the displayed dialogue on 8 dimensions.<br/><br/>
                    Your ratings will be on a 5-point scale, with 5 representing a very high degree of fit and 1 representing a very low degree of fit.<br/><br/>
                    The 8 dimensions are:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td><b>Grammatical</b></td>
                                <td>Response is free of grammatical and semantic errors.</td>
                            </tr>
                            <tr>
                                <td><b>Relevant</b></td>
                                <td>Response is on-topic with the immediate dialogue history.</td>
                            </tr>
                            <tr>
                                <td><b>Informative</b></td>
                                <td>Response produces unique and non-generic information that is specific to the dialogue context.</td>
                            </tr>
                            <tr>
                                <td><b>Emotion Aware</b></td>
                                <td>Response indicates an understanding of the other speaker’s current emotional state and provide an appropriate emotional reaction based on the current dialogue context.</td>
                            </tr>
                            <tr>
                                <td><b>Engaging</b></td>
                                <td>Response is engaging to the other speaker and fulfill the particular conversational goals implied by the other speaker.</td>
                            </tr>
                            <tr>
                                <td><b>Consistent</b></td>
                                <td>Response does not produce information that contradicts other information known about the system.</td>
                            </tr>
                            <tr>
                                <td><b>Proactive</b></td>
                                <td>Response actively and appropriately moves the conversation along different topics.</td>
                            </tr>
                            <tr>
                                <td><b>Quality</b></td>
                                <td>The overall quality of and satisfaction with the response.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                </div>
            )
        case "grammatical_likert":
            return (
                <div className="task-description">
                    <b><h4>Dialogue Rating Task: Grammatical</h4></b>
                    <br/>
                    Your task is to rate {speakerLabel} on how grammatical their responses were in the displayed dialogue.<br/><br/>
                    For this task, the definition of grammatical is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Grammatical</b></td>
                                <td>Responses are free of grammatical and semantic errors.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    {speakerLabel}'s performance is measured through consideration of all of their responses in the dialogue as a whole.<br/><br/>
                    Your ratings will be on a 5-point scale, with 5 representing a very high degree of fit and 1 representing a very low degree of fit.<br/><br/>
                </div>
            )
        case "relevant_likert":
            return (
                <div className="task-description">
                    <b><h4>Dialogue Rating Task: Relevant</h4></b>
                    <br/>
                    Your task is to rate {speakerLabel} on how relevant their responses were in the displayed dialogue.<br/><br/>
                    For this task, the definition of relevant is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Relevant</b></td>
                                <td>Responses are on-topic with the immediate dialogue history.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    {speakerLabel}'s performance is measured through consideration of all of their responses in the dialogue as a whole.<br/><br/>
                    Your ratings will be on a 5-point scale, with 5 representing a very high degree of fit and 1 representing a very low degree of fit.<br/><br/>
                </div>
            )
        case "informative_likert":
            return (
                <div className="task-description">
                    <b><h4>Dialogue Rating Task: Informative</h4></b>
                    <br/>
                    Your task is to rate {speakerLabel} on how informative their responses were in the displayed dialogue.<br/><br/>
                    For this task, the definition of informative is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Informative</b></td>
                                <td>Responses produce unique and non-generic information that is specific to the dialogue context.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    {speakerLabel}'s performance is measured through consideration of all of their responses in the dialogue as a whole.<br/><br/>
                    Your ratings will be on a 5-point scale, with 5 representing a very high degree of fit and 1 representing a very low degree of fit.<br/><br/>
                </div>
            )
        case "emotion_likert":
            return (
                <div className="task-description">
                    <b><h4>Dialogue Rating Task: Emotionally Appropriate</h4></b>
                    <br/>
                    Your task is to rate {speakerLabel} on how emotionally appropriate their responses were in the displayed dialogue.<br/><br/>
                    For this task, the definition of emotionally appropriate is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Emotionally Appropriate</b></td>
                                <td>Responses indicate an understanding of the other speaker’s current emotional state and provide an appropriate emotional reaction based on the current dialogue context.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    {speakerLabel}'s performance is measured through consideration of all of their responses in the dialogue as a whole.<br/><br/>
                    Your ratings will be on a 5-point scale, with 5 representing a very high degree of fit and 1 representing a very low degree of fit.<br/><br/>
                </div>
            )
        case "engaging_likert":
            return (
                <div className="task-description">
                    <b><h4>Dialogue Rating Task: Engaging</h4></b>
                    <br/>
                    Your task is to rate {speakerLabel} on how engaging their responses were in the displayed dialogue.<br/><br/>
                    For this task, the definition of engaging is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Engaging</b></td>
                                <td>Responses are engaging to the other speaker and fulfill the particular conversational goals implied by the other speaker.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    {speakerLabel}'s performance is measured through consideration of all of their responses in the dialogue as a whole.<br/><br/>
                    Your ratings will be on a 5-point scale, with 5 representing a very high degree of fit and 1 representing a very low degree of fit.<br/><br/>
                </div>
            )
        case "consistent_likert":
            return (
                <div className="task-description">
                    <b><h4>Dialogue Rating Task: Consistent</h4></b>
                    <br/>
                    Your task is to rate {speakerLabel} on how consistent their responses were in the displayed dialogue.<br/><br/>
                    For this task, the definition of consistent is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Consistent</b></td>
                                <td>Responses do not produce information that contradicts other information known about the system.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    {speakerLabel}'s performance is measured through consideration of all of their responses in the dialogue as a whole.<br/><br/>
                    Your ratings will be on a 5-point scale, with 5 representing a very high degree of fit and 1 representing a very low degree of fit.<br/><br/>
                </div>
            )
        case "proactive_likert":
            return (
                <div className="task-description">
                    <b><h4>Dialogue Rating Task: Proactive</h4></b>
                    <br/>
                    Your task is to rate {speakerLabel} on how proactive their responses were in the displayed dialogue.<br/><br/>
                    For this task, the definition of proactive is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Proactive</b></td>
                                <td>Responses actively and appropriately move the conversation along different topics.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    {speakerLabel}'s performance is measured through consideration of all of their responses in the dialogue as a whole.<br/><br/>
                    Your ratings will be on a 5-point scale, with 5 representing a very high degree of fit and 1 representing a very low degree of fit.<br/><br/>
                </div>
            )
        case "quality_likert":
            return (
                <div className="task-description">
                    <b><h4>Dialogue Rating Task: Quality</h4></b>
                    <br/>
                    Your task is to rate {speakerLabel} on the overall quality of their responses were in the displayed dialogue.<br/><br/>
                    For this task, the definition of quality is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Quality</b></td>
                                <td>The overall quality of and satisfaction with the responses.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    {speakerLabel}'s performance is measured through consideration of all of their responses in the dialogue as a whole.<br/><br/>
                    Your ratings will be on a 5-point scale, with 5 representing a very high degree of fit and 1 representing a very low degree of fit.<br/><br/>
                </div>
            )
        case "grammatical_likert_turn":
            return (
                <div className="task-description">
                    <b><h4>Response Rating Task: Grammatical</h4></b>
                    <br/>
                    Your task is to rate each of Alex's responses on their grammaticality in the displayed dialogue.<br/><br/>
                    For this task, the definition of grammatical is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Grammatical</b></td>
                                <td>Responses are free of grammatical and semantic errors.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    Your ratings will be on a 5-point scale, with 5 representing a very high degree of fit and 1 representing a very low degree of fit.<br/><br/>
                </div>
            )
        case "relevant_likert_turn":
            return (
                <div className="task-description">
                    <b><h4>Response Rating Task: Relevant</h4></b>
                    <br/>
                    Your task is to rate each of Alex's responses on their relevance in the displayed dialogue.<br/><br/>
                    For this task, the definition of relevant is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Relevant</b></td>
                                <td>Responses are on-topic with the immediate dialogue history.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    Your ratings will be on a 5-point scale, with 5 representing a very high degree of fit and 1 representing a very low degree of fit.<br/><br/>
                </div>
            )
        case "informative_likert_turn":
            return (
                <div className="task-description">
                    <b><h4>Response Rating Task: Informative</h4></b>
                    <br/>
                    Your task is to rate each of Alex's responses on their informativeness in the displayed dialogue.<br/><br/>
                    For this task, the definition of informative is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Informative</b></td>
                                <td>Responses produce unique and non-generic information that is specific to the dialogue context.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    Your ratings will be on a 5-point scale, with 5 representing a very high degree of fit and 1 representing a very low degree of fit.<br/><br/>
                </div>
            )
        case "emotion_likert_turn":
            return (
                <div className="task-description">
                    <b><h4>Response Rating Task: Emotionally Appropriate</h4></b>
                    <br/>
                    Your task is to rate each of Alex's responses on their emotional appropriateness in the displayed dialogue.<br/><br/>
                    For this task, the definition of emotionally appropriate is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Emotionally Appropriate</b></td>
                                <td>Responses indicate an understanding of the other speaker’s current emotional state and provide an appropriate emotional reaction based on the current dialogue context.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    Your ratings will be on a 5-point scale, with 5 representing a very high degree of fit and 1 representing a very low degree of fit.<br/><br/>
                </div>
            )
        case "engaging_likert_turn":
            return (
                <div className="task-description">
                    <b><h4>Response Rating Task: Engaging</h4></b>
                    <br/>
                    Your task is to rate each of Alex's responses on their engagingness in the displayed dialogue.<br/><br/>
                    For this task, the definition of engaging is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Engaging</b></td>
                                <td>Responses are engaging to the other speaker and fulfill the particular conversational goals implied by the other speaker.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    Your ratings will be on a 5-point scale, with 5 representing a very high degree of fit and 1 representing a very low degree of fit.<br/><br/>
                </div>
            )
        case "consistent_likert_turn":
            return (
                <div className="task-description">
                    <b><h4>Response Rating Task: Consistent</h4></b>
                    <br/>
                    Your task is to rate each of Alex's responses on their consistency in the displayed dialogue.<br/><br/>
                    For this task, the definition of consistent is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Consistent</b></td>
                                <td>Responses do not produce information that contradicts other information known about the system.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    Your ratings will be on a 5-point scale, with 5 representing a very high degree of fit and 1 representing a very low degree of fit.<br/><br/>
                </div>
            )
        case "proactive_likert_turn":
            return (
                <div className="task-description">
                    <b><h4>Response Rating Task: Proactive</h4></b>
                    <br/>
                    Your task is to rate each of Alex's responses on their proactivity in the displayed dialogue.<br/><br/>
                    For this task, the definition of proactive is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Proactive</b></td>
                                <td>Responses actively and appropriately move the conversation along different topics.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    Your ratings will be on a 5-point scale, with 5 representing a very high degree of fit and 1 representing a very low degree of fit.<br/><br/>
                </div>
            )
        case "quality_likert_turn":
            return (
                <div className="task-description">
                    <b><h4>Response Rating Task: Quality</h4></b>
                    <br/>
                    Your task is to rate each of Alex's responses on their overall quality in the displayed dialogue.<br/><br/>
                    For this task, the definition of quality is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Quality</b></td>
                                <td>The overall quality of and satisfaction with the responses.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    Your ratings will be on a 5-point scale, with 5 representing a very high degree of fit and 1 representing a very low degree of fit.<br/><br/>
                </div>
            )
        case "grammatical_comparative":
            return (
                <div className="task-description">
                    <b><h4>Dialogue Comparison Task: Grammatical</h4></b>
                    <br/>
                    Your task is to select which dialogue had more grammatical responses overall from {speakerLabel}.<br/><br/>
                    For this task, the definition of grammatical is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Grammatical</b></td>
                                <td>Responses are free of grammatical and semantic errors.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    {speakerLabel === 'your partner' ? comparativeNote() : ''}
                    <b>Selecting "There is no difference" should be a last resort, only if you are really struggling to see a difference between {speakerLabel} in the two dialogues.</b><br/><br/>
                </div>
            )
        case "relevant_comparative":
            return (
                <div className="task-description">
                    <b><h4>Dialogue Comparison Task: Relevant</h4></b>
                    <br/>
                    Your task is to select which dialogue had more relevant responses overall from {speakerLabel}.<br/><br/>
                    For this task, the definition of relevant is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Relevant</b></td>
                                <td>Responses are on-topic with the immediate dialogue history.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    {speakerLabel === 'your partner' ? comparativeNote() : ''}
                    <b>Selecting "There is no difference" should be a last resort, only if you are really struggling to see a difference between {speakerLabel} in the two dialogues.</b><br/><br/>
                </div>
            )
        case "informative_comparative":
            return (
                <div className="task-description">
                    <b><h4>Dialogue Comparison Task: Informative</h4></b>
                    <br/>
                    Your task is to select which dialogue had more informative responses overall from {speakerLabel}.<br/><br/>
                    For this task, the definition of informative is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Informative</b></td>
                                <td>Responses produce unique and non-generic information that is specific to the dialogue context.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    {speakerLabel === 'your partner' ? comparativeNote() : ''}
                    <b>Selecting "There is no difference" should be a last resort, only if you are really struggling to see a difference between {speakerLabel} in the two dialogues.</b><br/><br/>
                </div>
            )
        case "emotion_comparative":
            return (
                <div className="task-description">
                    <b><h4>Dialogue Comparison Task: Emotionally Appropriate</h4></b>
                    <br/>
                    Your task is to select which dialogue had more emotionally appropriate responses overall from {speakerLabel}.<br/><br/>
                    For this task, the definition of emotionally appropriate is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Emotionally Appropriate</b></td>
                                <td>Responses indicate an understanding of the other speaker’s current emotional state and provide an appropriate emotional reaction based on the current dialogue context.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    {speakerLabel === 'your partner' ? comparativeNote() : ''}
                    <b>Selecting "There is no difference" should be a last resort, only if you are really struggling to see a difference between {speakerLabel} in the two dialogues.</b><br/><br/>
                </div>
            )
        case "engaging_comparative":
            return (
                <div className="task-description">
                    <b><h4>Dialogue Comparison Task: Engaging</h4></b>
                    <br/>
                    Your task is to select which dialogue had more engaging responses overall from {speakerLabel}.<br/><br/>
                    For this task, the definition of engaging is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Engaging</b></td>
                                <td>Responses are engaging to the other speaker and fulfill the particular conversational goals implied by the other speaker.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    {speakerLabel === 'your partner' ? comparativeNote() : ''}
                    <b>Selecting "There is no difference" should be a last resort, only if you are really struggling to see a difference between {speakerLabel} in the two dialogues.</b><br/><br/>
                </div>
            )
        case "consistent_comparative":
            return (
                <div className="task-description">
                    <b><h4>Dialogue Comparison Task: Consistent</h4></b>
                    <br/>
                    Your task is to select which dialogue had more consistent responses overall from {speakerLabel}.<br/><br/>
                    For this task, the definition of consistent is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Consistent</b></td>
                                <td>Responses do not produce information that contradicts other information known about the system.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    {speakerLabel === 'your partner' ? comparativeNote() : ''}
                    <b>Selecting "There is no difference" should be a last resort, only if you are really struggling to see a difference between {speakerLabel} in the two dialogues.</b><br/><br/>
                </div>
            )
        case "proactive_comparative":
            return (
                <div className="task-description">
                    <b><h4>Dialogue Comparison Task: Proactive</h4></b>
                    <br/>
                    Your task is to select which dialogue had more proactive responses overall from {speakerLabel}.<br/><br/>
                    For this task, the definition of proactive is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Proactive</b></td>
                                <td>Responses actively and appropriately move the conversation along different topics.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    {speakerLabel === 'your partner' ? comparativeNote() : ''}
                    <b>Selecting "There is no difference" should be a last resort, only if you are really struggling to see a difference between {speakerLabel} in the two dialogues.</b><br/><br/>
                </div>
            )
        case "quality_comparative":
            return (
                <div className="task-description">
                    <b><h4>Dialogue Comparison Task: Quality</h4></b>
                    <br/>
                    Your task is to select which dialogue had higher quality responses overall from {speakerLabel}.<br/><br/>
                    For this task, the definition of quality is:<br/><br/>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{padding: '15px'}}><b>Quality</b></td>
                                <td>The overall quality of and satisfaction with the responses.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    {speakerLabel === 'your partner' ? comparativeNote() : ''}
                    <b>Selecting "There is no difference" should be a last resort, only if you are really struggling to see a difference between {speakerLabel} in the two dialogues.</b><br/><br/>
                </div>
            )

        case "transitions":
            return (
                <div className="task-description">
                    <b><h3>Transitions during Dialogue</h3></b>
                    <br/>

                    <b><h4>Instructions</h4></b>

                    {get_transitions_instructions()}

                    <h4>Help</h4>
                    If you are unsure of the correct answer to a question, a help section
                    is provided below for each type of question.
                    Clicking on the help icon <i className="fa fa-question-circle" style={{color: "red"}}/> next to each question will open and jump to the relevant help section.

                    <br/><br/>

                    {get_transitions_help()}

                    <br/>
                </div>
            )

        case "knowledge":
            return (
                <div className="task-description">
                    <b><h3>Incorporating Knowledge in Dialogue</h3></b>
                    <br/>

                    <b><h4>Overview</h4></b>

                    The goal of this task is to identify when factual knowledge is being used within a dialogue, and to
                    discriminate whether it is an accurate or inaccurate usage.<br/><br/>

                    <b><h4>Instructions</h4></b>

                    Factual knowledge is information presented about the world that is often learned by reading or
                    being taught.<br/><br/>

                    In order to be considered factual information for this task, the presented information must be:<br/>
                    <ul >
                        <li ><b>public</b>: includes entities or facts that are relevant to the broader public, not just personal information.  </li>
                        <li ><b>specific</b>: mentions specific entities or facts, not just broad categories or generalizations.  </li>
                        <li ><b>objective</b>: presents objective information, not just opinions or personal beliefs. </li>
                    </ul>

                    Some examples of factual information include:<br/>

                    <ul >
                        <li >historical or news events</li>
                        <li >public figures or organizations</li>
                        <li >publications or works of art, including books and movies</li>
                        <li >scientific information</li>
                        <li >specific named products or services</li>
                        <li >etc.</li>
                    </ul>

                    <b>Do not mark</b> a turn as using factual knowledge if the turn could be interpreted as expressing:<br/>

                    <ul >
                        <li >opinions or value judgements</li>
                        <li >estimates or predictions</li>
                        <li >personal information about the speaker or their partner</li>
                        <li >information about things in either speaker's life that are not publicly relevant</li>
                    </ul>

                    It is possible for there to be more than one claim about factual knowledge being made in a turn,
                    in which case you need to consider all relevant claims when completing the task.<br/><br/>

                    Mark usages of factual knowledge as accurate when the claim is true and can be verified by trustworthy sources,
                    and as inaccurate when the claim is false, highly implausible, or clearly misleading.

                    <br/><br/>

                    <h4>Help</h4>
                    If you are unsure whether to mark the checkbox or how to answer one of the questions, a help section
                    is provided below for each type of question.
                    Clicking on the help icon <i className="fa fa-question-circle" style={{color: "red"}}/> next to each question will open and jump to the relevant help section.

                    <br/><br/>

                    {get_knowledge_help()}

                    <br/>
                </div>
            )
        case "consistency_label_header":
            return (
                <div key="consistency_label_header" className="task-description">
                    <b><h3>Speaker Consistency in Dialogue</h3></b>
                    <br/>
                    <b><h4>Overview</h4></b>
                    This task explores how consistent Alex's responses are within a dialogue.<br/><br/>
                    For each of Alex's responses, you must decide all of the consistency labels that are
                    applicable, if any.<br/>

                    <b><h4>Instructions</h4></b>

                    The consistency labels you are considering are:<br/><br/>
                    {get_consistency_table()}

                </div>
            )
        case "consistency_label":
            return (
                <div key="consistency_label" className="task-description">

                    <b><h3>Speaker Consistency in Dialogue</h3></b>
                    <br/>
                    <b><h4>Overview</h4></b>

                    {get_consistency_instructions()}

                    <h4>Help</h4>

                    Details and examples for each label are provided in their respective help sections below.<br/><br/>

                    {get_consistency_examples()}

                </div>
            )
        case "grammar":
            return (
                <div className="task-description">
                    <b><h3>Interpretability of Dialogue Responses</h3></b>
                    <br/>

                    {get_interpretability_error_instructions()}

                    <br/><br/>

                    <h4>Help</h4>
                    {get_interpretability_error_examples()}

                </div>
            )
        case "sociality":
            return (
                <div className="task-description">
                    <b><h3>Antisocial Behaviors in Dialogue</h3></b>
                    <br/>

                    {get_antisocial_behaviors_instructions()}

                    <br/><br/>

                    <h4>Help</h4>
                    {get_antisocial_behaviors_examples()}

                </div>
            )
        case "commonsense":
            return (
                <div className="task-description">
                    <b><h3>Contradicting Common Knowledge in Dialogue</h3></b>
                    <br/>

                    {get_common_knowledge_contradiction_instructions()}

                    <br/><br/>

                    <h4>Help</h4>
                    {get_common_knowledge_contradiction_examples()}

                    <br/>
                </div>
            )
        case "empathy":
            return (
                <div className="task-description">
                    <b><h3>Empathy in Dialogue</h3></b>
                    <br/>

                    {get_empathy_instructions()}

                    <br/><br/>

                    <h4>Help</h4>
                    {get_empathy_examples()}

                </div>
            )
        case "personal_information":
            return (
                <div className="task-description">
                    <b><h3>Personal Information Sharing in Dialogue</h3></b>
                    <br/>

                    {get_personal_information_sharing_instructions()}

                    <br/><br/>

                    <h4>Help</h4>
                    {get_personal_information_sharing_examples()}

                </div>
            )
        default:
            break;
    }
    return (
        <div className="task-description">
            <b><h4>Task Description</h4></b>
            <br/>
            Dummy Task Description.

            Lorem ipsum.
            <br/>
        </div>
    )
}

function comparativeNote(){
    return (
        <div>
            Note that your selection does not have to be consistent with any of the numeric scores you have
            assigned to these dialogues earlier in this task.
            Even if you remember giving both dialogues a similar numeric rating, do your best to distinguish which
            dialogue most closely matches the provided description.
            <br/><br/>
        </div>
    );
}

export function compileTaskDescription(subtaskData, task_title, taskConfig){
  const partner_persona = subtaskData.bot_persona;
  let speakerLabel, otherLabel;
  if (taskConfig.do_collect_dialogue){
    speakerLabel = 'your partner';
    otherLabel = 'you';
  } else {
    speakerLabel = 'Alex';
    otherLabel = 'Sam';
  }
  let task_description = getTaskDescription(task_title, speakerLabel, otherLabel);
  return task_description;
}