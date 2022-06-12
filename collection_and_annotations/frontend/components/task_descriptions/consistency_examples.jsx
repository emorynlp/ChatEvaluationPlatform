import React from "react";
import { collapsibleClick } from "./collapsibleClick.jsx";

function get_consistency_examples() {
return (
<div>
<button id="Contradicts Self Context" className="collapsible" onClick={(evt) => collapsibleClick(evt)} >
  Contradicts Self Context
</button>
<div className="content" >
  <span >
    <code >
      <span className="sam-response" >
        Sam:  What do you do for a living?
      </span>
      <span className="alex-response" >
        Alex: I'm a software engineer.
      </span>
      <span className="sam-response" >
        Sam:  What kinds of things do you work on?
      </span>
      <span className="alex-response" >
        Alex: I work as a university instructor, so I give lectures and grade assignments.
      </span>
    </code>
    <br >
    </br>
    <b>Contradicts Self Context</b>
    <br >
    </br>
    <br >
    </br>
    <b>Explanation</b>: Alex presents two mutually exclusive answers for his occupation.
    <br >
    </br>
    <br >
    </br>
    <hr >
    </hr>
    <code >
      <span className="sam-response" >
        Sam:  What are you going to have for dinner?
      </span>
      <span className="alex-response" >
        Alex: Probably a burger.
      </span>
      <span className="sam-response" >
        Sam:  Sounds good.
      </span>
      <span className="alex-response" >
        Alex: Actually I just remembered tonight is pasta night. 
      </span>
    </code>
    <br >
    </br>
    <b>Does Not Contradict Self Context</b>
    <br >
    </br>
    <br >
    </br>
    <b>Explanation</b>: Self-corrections do not count as contradictions.
    <br >
    </br>
    <br >
    </br>
    <hr >
    </hr>
  </span>
</div>
<button id="Contradicts Partner Context" className="collapsible" onClick={(evt) => collapsibleClick(evt)} >
  Contradicts Partner Context
</button>
<div className="content" >
  <span >
    <code >
      <span className="sam-response" >
        Sam:  I have one sister and one brother.
      </span>
      <span className="alex-response" >
        Alex: Oh ok, do you get along?
      </span>
      <span className="sam-response" >
        Sam:  Yeah.
      </span>
      <span className="alex-response" >
        Alex: What do you like to do with your brothers?
      </span>
    </code>
    <br >
    </br>
    <b>Contradicts Partner Context</b>
    <br >
    </br>
    <br >
    </br>
    <b>Explanation</b>: Alex's question implies Sam has multiple brothers, which contradicts information Sam has previously shared.
    <br >
    </br>
    <br >
    </br>
    <hr >
    </hr>
    <code >
      <span className="alex-response" >
        Alex: My favorite movie is Iron Man.
      </span>
      <span className="sam-response" >
        Sam:  Cool, I like the Marvel movies.
      </span>
      <span className="alex-response" >
        Alex: Do you like the Marvel movies?
      </span>
    </code>
    <br >
    </br>
    <b>Contradicts Partner Context</b>
    <br >
    </br>
    <br >
    </br>
    <b>Explanation</b>: Alex is asking a question that Sam has already provided an answer to, so it seems as if Alex has forgotten what their partner has said, which makes this a contradiction. Note that in this case you should also select the <b>redundant</b> label too!
    <br >
    </br>
    <br >
    </br>
    <hr >
    </hr>
    <code >
      <span className="sam-response" >
        Sam:  I have one sister and one brother.
      </span>
      <span className="alex-response" >
        Alex: That's great.
      </span>
      <span className="sam-response" >
        Sam:  Yeah we get along well.
      </span>
      <span className="alex-response" >
        Alex: What do you like to do with your brother and sister?
      </span>
    </code>
    <br >
    </br>
    <b>Does Not Contradict Partner Context</b>
    <br >
    </br>
    <br >
    </br>
    <b>Explanation</b>: Alex does not misremember Sam's siblings.
    <br >
    </br>
    <br >
    </br>
    <hr >
    </hr>
  </span>
</div>
<button id="Redundant" className="collapsible" onClick={(evt) => collapsibleClick(evt)} >
  Redundant
</button>
<div className="content" >
  <span >
    <code >
      <span className="alex-response" >
        Alex: My favorite movie is Iron Man.
      </span>
      <span className="sam-response" >
        Sam:  Cool, I like the Marvel movies.
      </span>
      <span className="alex-response" >
        Alex: Yeah me too, I especially like Iron Man.
      </span>
    </code>
    <br >
    </br>
    <b>Redundant</b>
    <br >
    </br>
    <br >
    </br>
    <b>Explanation</b>: Alex's response does not make any novel contribution to the dialogue, because it covers previously stated information.
    <br >
    </br>
    <br >
    </br>
    <hr >
    </hr>
    <code >
      <span className="alex-response" >
        Alex: My favorite movie is Iron Man.
      </span>
      <span className="sam-response" >
        Sam:  Cool, I like the Marvel movies.
      </span>
      <span className="alex-response" >
        Alex: Do you like the Marvel movies?
      </span>
    </code>
    <br >
    </br>
    <b>Redundant</b>
    <br >
    </br>
    <br >
    </br>
    <b>Explanation</b>: Alex is asking a question that Sam has already provided an answer to, so it is redundant. Note that in this case you should also select the <b>contradicts partner context</b> label too!
    <br >
    </br>
    <br >
    </br>
    <hr >
    </hr>
    <code >
      <span className="alex-response" >
        Alex: Let's talk about food.
      </span>
      <span className="sam-response" >
        Sam:  Well, pizza is the best food.
      </span>
      <span className="alex-response" >
        Alex: Pizza is the best food.
      </span>
    </code>
    <br >
    </br>
    <b>Not Redundant</b>
    <br >
    </br>
    <br >
    </br>
    <b>Explanation</b>: Although Alex's response makes the same claim as Sam's, the primary function of the response is to agree with Sam. Since their agreement on the best food has not previously been established, the response does not constitute a redundant turn.
    <br >
    </br>
    <br >
    </br>
    <hr >
    </hr>
    <code >
      <span className="alex-response" >
        Alex: Have you ever been to Europe?
      </span>
      <span className="sam-response" >
        Sam:  I like to watch movies in my free time.
      </span>
      <span className="alex-response" >
        Alex: But have you ever been to Europe?
      </span>
    </code>
    <br >
    </br>
    <b>Not Redundant</b>
    <br >
    </br>
    <br >
    </br>
    <b>Explanation</b>: Since Sam did not answer Alex's question, repeating the question is not redundant.
    <br >
    </br>
    <br >
    </br>
    <hr >
    </hr>
  </span>
</div>

</div>
)
}
export { get_consistency_examples };