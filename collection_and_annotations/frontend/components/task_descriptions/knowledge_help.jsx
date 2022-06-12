import React from "react";
import { collapsibleClick } from "./collapsibleClick.jsx";

function get_knowledge_help() {
return (
<div>
<button id="Does SPEAKER_X's response use, claim, or assume any FACTS (either correct or incorrect)?" className="collapsible" onClick={(evt) => collapsibleClick(evt)} >
  Does Alex's response use, claim, or assume any FACTS (either correct or incorrect)?
</button>
<div className="content" >
  <code >
    <span className="sam-response" >
      Sam:  Do you have a bucket list spot you want to climb?
    </span>
    <span className="alex-response" >
      Alex: Mount Mitchell, since it's the tallest mountain.
    </span>
  </code>
  <br >
  </br>
  <span >
    Alex's response incorporates or assumes at least one fact.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Alex's response states that Mount Mitchell is the tallest mountain, which is a factual claim (even though it is incorrect: Mount Everest is actually the tallest mountain in the world).
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="sam-response" >
      Sam:  What have you been up to?
    </span>
    <span className="alex-response" >
      Alex: I just got back from France.
    </span>
  </code>
  <br >
  </br>
  <span >
    Alex's response incorporates or assumes at least one fact.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Alex's response mentions a specific entity - France. Notice that although no specific claims are made about France, Alex is mentioning France as if it is a public entity that Sam should know, which means this should be marked as using factual knowledge.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="alex-response" >
      Alex: Robert Downey Jr. is a great actor.
    </span>
  </code>
  <br >
  </br>
  <span >
    Alex's response incorporates or assumes at least one fact.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Although overall Alex is giving an opinion, her response mentions Robert Downey Jr. as a specific public figure.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="sam-response" >
      Sam:  What did you do over the summer? Take any trips?
    </span>
    <span className="alex-response" >
      Alex: I went to Lankren for a few weeks, it was a great vacation.
    </span>
  </code>
  <br >
  </br>
  <span >
    Alex's response incorporates or assumes at least one fact.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Alex mentions a specific location - Lankren - as if it's a real place that Sam might know about. Even though Lankren is a made-up place, Alex's presentation of Lankren as a specific, publicly relevant location constitutes an attempt at incorporating factual knowledge.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="sam-response" >
      Sam:  Tell me about yourself.
    </span>
    <span className="alex-response" >
      Alex: I like Dave's Killer Burger, which is a special recipe that my friend Dave makes at barbeques.
    </span>
  </code>
  <br >
  </br>
  <span >
    No, Alex's response does not incorporate or assume at least one fact.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Alex mentions a specific entity - Dave's killer burger. However, because Alex continues to clarify that Dave's killer burger is her friend's recipe, she is not presenting Dave's killer burger as publicly relevant. Thus, no factual information is being used here, only information personal to the speaker.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="sam-response" >
      Sam:  I really like cats.
    </span>
    <span className="alex-response" >
      Alex: Did you know, cats have a wider field of vision that humans.
    </span>
  </code>
  <br >
  </br>
  <span >
    Alex's response incorporates or assumes at least one fact.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Alex incorporates specific factual knowledge about cats into her response. Since she presents this information as objective, rather than her own opinion or belief, the response should be labeled as incorporating factual knowledge. Note that the response should be marked as incorporating factual information regardless of its correctness, as long as the information is specific and presented as objective.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="sam-response" >
      Sam:  What's something that scares you?
    </span>
    <span className="alex-response" >
      Alex: It might sound silly to some people, but I think ghosts are real and they really scare me.
    </span>
  </code>
  <br >
  </br>
  <span >
    No, Alex's response does not incorporate or assume at least one fact.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Alex is presenting a personal belief that ghosts are real, but is not presenting this as an objective fact.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="sam-response" >
      Sam:  What's your favorite kind of food?
    </span>
    <span className="alex-response" >
      Alex: I like Thai food.
    </span>
  </code>
  <br >
  </br>
  <span >
    No, Alex's response does not incorporate or assume at least one fact.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Although Alex mentions Thai food in her response, she presents it as a broad category of food rather than as a specific mention of a publicly relevant entity. Broad categories such as this do not count as factual information. If Alex had mentioned something more specific, such as the country Thailand or the dish Pad Thai, she would have been incorporating factual information and the response should be marked as such.
  </span>
  <br >
  </br>
  <hr >
  </hr>
</div>
<button id="Do you know whether ALL of the facts that SPEAKER_X uses or assumes are accurate?" className="collapsible" onClick={(evt) => collapsibleClick(evt)} >
  Do you know whether ALL of the facts that Alex uses or assumes are accurate?
</button>
<div className="content" >
  <code >
    <span className="sam-response" >
      Sam:  What country would you visit?
    </span>
    <span className="alex-response" >
      Alex: I'd go to France.
    </span>
  </code>
  <br >
  </br>
  <span >
    Yes, I know for sure ALL facts are accurate.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> France is indeed a country, so everything Alex said is factually accurate.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="sam-response" >
      Sam:  What country would you visit?
    </span>
    <span className="alex-response" >
      Alex: I'd go to Texas.
    </span>
  </code>
  <br >
  </br>
  <span >
    No, I know for sure that one of the facts is inaccurate, false, or highly implausible.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Texas is a state in the USA but is not a country.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="alex-response" >
      Alex: Our universe is actually a computer simulation created by a more intelligent life form.
    </span>
  </code>
  <br >
  </br>
  <span >
    It is misleading for Alex to claim or assume one of the facts, because there is no way that Alex knows whether that fact is accurate.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Alex makes a factual claim that might be possible, but this fact is not currently known to be true or false. Therefore, it is misleading for Alex to present the fact as if she knows it is true.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="alex-response" >
      Alex: I went to Kathmandu, the capital of Nepal last month.
    </span>
  </code>
  <br >
  </br>
  <span >
    I don't know for sure whether ALL of the facts are accurate.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="alex-response" >
      Alex: I went to Kiritipur, the capital of Nepal last month.
    </span>
  </code>
  <br >
  </br>
  <span >
    I don't know for sure whether ALL of the facts are accurate.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="sam-response" >
      Sam:  What did you do over the summer? Take any trips?
    </span>
    <span className="alex-response" >
      Alex: I went to Lankren for a few weeks, it was a great vacation.
    </span>
  </code>
  <br >
  </br>
  <span >
    I don't know for sure whether ALL of the facts are accurate.
  </span>
  <br >
  </br>
  <hr >
  </hr>
</div>
<button id="Take 60 seconds to search ALL unknown facts on the internet. Does your search verify or falsify ALL the facts?" className="collapsible" onClick={(evt) => collapsibleClick(evt)} >
  Take 60 seconds to search ALL unknown facts on the internet. Does your search verify or falsify ALL the facts?
</button>
<div className="content" >
  <code >
    <span className="alex-response" >
      Alex: I went to Kathmandu, the capital of Nepal last month.
    </span>
  </code>
  <br >
  </br>
  <span >
    ALL facts are accurate; a credible source verified the facts in my search.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> A quick Google search shows Kathmandu is indeed the capital of Nepal.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="alex-response" >
      Alex: I went to Kiritipur, the capital of Nepal last month.
    </span>
  </code>
  <br >
  </br>
  <span >
    One of the facts is inaccurate; a credible source falsified the fact or revealed that it is highly implausible.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> A quick Google search shows Kathmandu is the capital of Nepal, not Kiritipur.
  </span>
  <br >
  </br>
  <hr >
  </hr>
  <code >
    <span className="sam-response" >
      Sam:  What did you do over the summer? Take any trips?
    </span>
    <span className="alex-response" >
      Alex: I went to Lankren for a few weeks, it was a great vacation.
    </span>
  </code>
  <br >
  </br>
  <span >
    One of the facts is inaccurate; a credible source falsified the fact or revealed that it is highly implausible.
  </span>
  <br >
  </br>
  <br >
  </br>
  <span >
    <b>Explanation:</b> Alex presents Lankren as a specific, public location. However, a quick google search reveals that there is no such location called Lankren that one could vacation to. Therefore, Alex's presentation of this location is an inaccurate usage of factual information.
  </span>
  <br >
  </br>
  <hr >
  </hr>
</div>

</div>
)
}
export { get_knowledge_help };