import React from "react";
function get_interpretability_error_instructions() {
return (
<div>
<span >
  Identify all uninterpretable responses.
</span>
<br >
</br>
<br >
</br>
<span >
  A response is uninterpretable if it:
</span>
<ul >
  <li >
    is highly ambiguous and does not have one specific and clear meaning
  </li>
  <li >
    takes a lot of effort to understand what the intended meaning is
  </li>
  <li >
    contains any phrase that is difficult to derive meaning from, usually due to the use of nonsense words or grammar problems
  </li>
</ul>
<br >
</br>
<br >
</br>
<span >
  Pay careful attention and DO NOT MARK if the problem is that the response...
</span>
<ul >
  <li >
    is illogical or contradicts common knowledge
  </li>
  <li >
    does not make sense as an answer to the previous question
  </li>
  <li >
    is off-topic or contradictory to the context
  </li>
  <li >
    contains a phrase that is technically ungrammatical, but conveys a clear meaning in the context
  </li>
  <li >
    uses a made-up word that is easily and completely interpretable in the context
  </li>
  <li >
    uses slang words or phrases. If you are unsure whether some phrase is slang, you should look up the phrase online (e.g. on urban dictionary) to check whether the response is interpretable.
  </li>
</ul>

</div>
)
}
export { get_interpretability_error_instructions };