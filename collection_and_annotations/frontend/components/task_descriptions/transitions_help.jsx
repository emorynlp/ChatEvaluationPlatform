import React from "react";
import { collapsibleClick } from "./collapsibleClick.jsx";

function get_transitions_help() {
return (
<div>
<button id="Does SPEAKER_X appropriately acknowledge SPEAKER_Y with this response?" className="collapsible" onClick={(evt) => collapsibleClick(evt)} >
  Does Alex appropriately acknowledge Sam with this response?
</button>
<div className="content" >
  <code >
    <span className="alex-response" >
      Alex: I like Avengers. Probably because I first saw it as a kid, so there's some nostalgia.
    </span>
    <span className="sam-response" >
      Sam: Right that makes sense.
    </span>
    <span className="alex-response" >
      Alex: So, what other movies do you like?
    </span>
  </code>
  <br >
  </br>
  <span >
    Not applicable, what Sam just said does not require a response or acknowledgement from Alex.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Since Sam simply acknowledged his understanding of Alex's turn, Sam did not introduce any questions, comments, or ideas that Alex is expected to respond to.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="alex-response" >
      Alex: What's your favorite movie?
    </span>
    <span className="sam-response" >
      Sam:  I really like Star Wars.
    </span>
    <span className="alex-response" >
      Alex: Have you ever seen Inception?
    </span>
  </code>
  <br >
  </br>
  <span >
    No, Alex ignored Sam.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Even though Alex's response is relevant to the current discussion, Alex does not acknowledge what Sam said in any way.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="alex-response" >
      Alex: What's your favorite movie?
    </span>
    <span className="sam-response" >
      Sam:  I really like Star Wars.
    </span>
    <span className="alex-response" >
      Alex: Oh okay. My favorite is probably Avengers.
    </span>
  </code>
  <br >
  </br>
  <span >
    Yes, Alex directly responds to or acknowledges what Sam just said, OR Alex's response implies that she understood what Sam just said.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Although simple, Alex's acknowledgement ("oh okay") signals that she understood what Sam said.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="alex-response" >
      Alex: What's your favorite movie?
    </span>
    <span className="sam-response" >
      Sam:  I really like the Star Wars series.
    </span>
    <span className="alex-response" >
      Alex: What did you think of the recent ones?
    </span>
  </code>
  <br >
  </br>
  <span >
    Yes, Alex directly responds to or acknowledges what Sam just said, OR Alex's response implies that she understood what Sam just said.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Although Alex does not acknowledge what Sam said directly, her response implicitly signals that she understood Sam by following-up on what Sam said.
  </span>
  <br >
  </br>
  <hr >
  </hr>
</div>
<button id="Is SPEAKER_X introducing a new topic?" className="collapsible" onClick={(evt) => collapsibleClick(evt)} >
  Is Alex introducing a new topic?
</button>
<div className="content" >
  <code >
    <span className="alex-response" >
      Alex: What's your favorite movie?
    </span>
    <span className="sam-response" >
      Sam:  I really like Star Wars.
    </span>
    <span className="alex-response" >
      Alex: That's cool. Have you ever been to Europe?
    </span>
  </code>
  <br >
  </br>
  <span >
    Yes, Alex is changing the topic of the conversation.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Since the current conversation was about movies, asking if the other person has ever been to Europe is changing the topic.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="alex-response" >
      Alex: What's your favorite movie?
    </span>
    <span className="sam-response" >
      Sam:  I really like Star Wars.
    </span>
    <span className="alex-response" >
      Alex: Have you ever seen Inception?
    </span>
  </code>
  <br >
  </br>
  <span >
    No, Alex is introducing a new talking point but it is still within the current topic of conversation.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Since the current conversation was about movies, specifically Star Wars, asking if the other person has seen Inception is still within the current topic of conversation but it is a new talking point.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="alex-response" >
      Alex: What's your favorite movie?
    </span>
    <span className="sam-response" >
      Sam:  I really like Star Wars.
    </span>
    <span className="alex-response" >
      Alex: Me too. I really love yoda and grogu! Why do you like Star Wars so much?
    </span>
  </code>
  <br >
  </br>
  <span >
    No, Alex is ONLY responding to, building on, or further exploring what Sam said in the previous turn.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Since the previous turn was about the other person's love for Star Wars, asking the other person their reasons for enjoying it is following up on the ideas already presented in the conversation.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="alex-response" >
      Alex: I think the original trilogy is the best. What about you?
    </span>
    <span className="sam-response" >
      Sam:  I really like newer star wars movies. I find the world so much cooler because the visuals are so awesome!
    </span>
    <span className="alex-response" >
      Alex: yeah, I can see that. Who is your favorite character in Star Wars?
    </span>
  </code>
  <br >
  </br>
  <span >
    No, Alex is introducing a new talking point but it is still within the current topic of conversation.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> The speakers have been discussing their opinions on the different Star Wars movies, so asking about the other speaker's favorite character is still within the current topic of conversation but it is a new talking point.
  </span>
  <br >
  </br>
  <hr >
  </hr>
</div>
<button id="Is SPEAKER_X's response appropriately relevant?" className="collapsible" onClick={(evt) => collapsibleClick(evt)} >
  Is Alex's response appropriately relevant?
</button>
<div className="content" >
  <code >
    <span className="sam-response" >
      Sam:  I am trying to find a good pizza place near my house. 
    </span>
    <span className="alex-response" >
      Alex: Are you having a party?
    </span>
  </code>
  <br >
  </br>
  <span >
    Yes, Alex is ONLY responding to, building on, or further exploring what Sam said in the previous turn.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Alex follows up on what Sam said by asking for more detail and explanation.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="sam-response" >
      Sam:  I am trying to find a good pizza place near my house. 
    </span>
    <span className="alex-response" >
      Alex: I hope you find a good place. I actually ate pizza earlier today.
    </span>
  </code>
  <br >
  </br>
  <span >
    Yes, Alex appropriately introduces a new talking point, discussion, or topic.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Although Alex reacts to what Sam said ("I hope you find a good place."), she also introduces a new talking point that does NOT follow-up on what Sam said ("I actually ate pizza earlier today").
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="sam-response" >
      Sam:  I am trying to find a good pizza place near my house. 
    </span>
    <span className="alex-response" >
      Alex: I'm sure there's lots of good places if you live in Chicago.
    </span>
  </code>
  <br >
  </br>
  <span >
    Yes, Alex is ONLY responding to, building on, or further exploring what Sam said in the previous turn.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Alex expands on the discussion point introduced by Sam, rather than introducing a new point.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="sam-response" >
      Sam:  I am trying to find a good pizza place near my house. 
    </span>
    <span className="alex-response" >
      Alex: Have you ever been fishing?
    </span>
  </code>
  <br >
  </br>
  <span >
    No, the response feels abrupt and interrupts the current discussion.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> There is little to no relation between Alex's question about fishing and what Sam just said. Alex's question abruptly and inappropriately changes the course of the conversation.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="alex-response" >
      Alex: So that's why it's my favorite.
    </span>
    <span className="sam-response" >
      Sam:  Yeah that makes sense.
    </span>
    <span className="alex-response" >
      Alex: So anyway, do you have any plans for the weekend?
    </span>
  </code>
  <br >
  </br>
  <span >
    Yes, Alex appropriately introduces a new talking point, discussion, or topic.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Although Alex's question about the weekend is unrelated to the previous discussion, the previous discussion had reached a natural conclusion. In this context, Alex's response is a natural topic transition and is not abrupt or interruptive.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="alex-response" >
      Alex: What's your favorite movie?
    </span>
    <span className="sam-response" >
      Sam:  I really like Star Wars.
    </span>
    <span className="alex-response" >
      Alex: My favorite is probably Avengers.
    </span>
  </code>
  <br >
  </br>
  <span >
    Yes, Alex appropriately introduces a new talking point, discussion, or topic.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Even though Alex's response is slightly inappropriate because it does not acknowledge what Sam just said, the response is relevant and does not interrupt the current discussion. Alex's response is, however, a new talking point rather than a follow-up, because it does not respond to, build on, or further explore Sam's answer in the previous turn.
  </span>
  <br >
  </br>
  <hr >
  </hr>
</div>

</div>
)
}
export { get_transitions_help };