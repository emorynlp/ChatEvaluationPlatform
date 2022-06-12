import React from "react";
function get_consistency_instructions() {
return (
<div>
<span >
  This task explores how consistent Alex's responses are within a dialogue. For each of Alex's responses, you must decide all of the consistency labels that are applicable, if any.
</span>
<br >
</br>
<br >
</br>
<span >
  It is often the case that MORE THAN ONE label is applicable to a single turn. It is important to select the appropriate label for EVERY occurrence, not just the first time it happens.
</span>
<br >
</br>
<br >
</br>
<span >
  The 3 consistency labels you are considering are:
</span>
<br >
</br>
<br >
</br>
<span >
  <b>1. Contradicts Self Context</b>
</span>
<br >
</br>
<br >
</br>
<span >
  The speaker says something that doesn't make sense, either because it is a contradiction of something they have said previously or it is extremely implausible based on the information they have already shared.
</span>
<br >
</br>
<br >
</br>
<span >
  <b>2. Contradicts Partner Context</b>
</span>
<br >
</br>
<br >
</br>
<span >
  The turn is inconsistent with what Sam has said in the conversation history.
</span>
<br >
</br>
<br >
</br>
<span >
  For this label, judge whether the turn demonstrates that the speaker has forgotten or misremembered what their partner has said earlier in the conversation.
</span>
<br >
</br>
<br >
</br>
<span >
  <b>3. Redundant</b>
</span>
<br >
</br>
<br >
</br>
<span >
  The speaker repeats something either of the speakers has said earlier in the conversation in a way where most people would find it clearly inappropriate, annoying, or unnatural.
</span>
<br >
</br>
<br >
</br>
<span >
  Note that many cases of repetition are appropriate, such as when a speaker...
</span>
<ul >
  <li >
    reiterates an idea as an acknowledgement
  </li>
  <li >
    elaborates on an earlier point
  </li>
  <li >
    repeats something for additional emphasis
  </li>
  <li >
    summarizes a discussion or thought
  </li>
</ul>
<br >
</br>
<br >
</br>

</div>
)
}
export { get_consistency_instructions };