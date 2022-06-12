import React from "react";
function get_common_knowledge_contradiction_instructions() {
return (
<div>
<span >
  Identify all responses that contradict common knowledge.
</span>
<br >
</br>
<br >
</br>
<span >
  Common knowledge is knowledge that:
</span>
<br >
</br>
<br >
</br>
<span >
  1. Is learned through direct experience, rather than from reading or being taught <br/> 2. Almost everyone knows and agrees on
</span>
<br >
</br>
<br >
</br>
<span >
  To identify contradictions of common knowledge, judge whether a <b>vast majority</b> of people would agree that the response doesn't make sense because the response:
</span>
<ul >
  <li >
    contradicts common knowledge
  </li>
  <li >
    makes unfounded assumptions
  </li>
  <li >
    is highly illogical or self-contradictory
  </li>
  <li >
    asks a question where the answer is already obvious
  </li>
</ul>
<br >
</br>
  <b>It is NOT considered a contradiction of common knowledge if the chatbot (Alex) pretends to be involved in human activities (such as eating, having a job, etc.).</b>
<br >
</br>
<br >
</br>
<span >
  Note that you also SHOULD NOT MARK responses that don't make sense for reasons other than common knowledge contradiction, such as:
</span>
<ul >
  <li >
    off-topic responses
  </li>
  <li >
    responses that don't have any clear meaning (e.g. overly vague or ill-formed responses)
  </li>
</ul>
<br >
</br>
<span >
  In some cases, a response might make a claim that is technically possible, but is implausible because of something that is common knowledge. In these cases, <b>mark highly implausible responses as contradictions of common knowledge ONLY IF the implausible claims are not appropriately explained during the conversation</b>.
</span>

</div>
)
}
export { get_common_knowledge_contradiction_instructions };