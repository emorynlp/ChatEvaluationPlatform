import React from "react";
function get_transitions_instructions() {
return (
<div>
<span >
  Categorize responses based on their appropriateness to the context they appear in. There are 3 facets to consider for this task:
</span>
<br >
</br>
<br >
</br>
<span >
  <b>1. Acknowledgements</b>
</span>
<br >
</br>
<br >
</br>
<span >
  A response is an appropriate acknowledgement when it is clear that the speaker is responding directly to what their partner just said. This could be from an explicit acknowledgement (e.g. saying "okay" at the beginning of the response), or from a response where the speaker implicitly shows an understanding of what their partner said.
</span>
<br >
</br>
<br >
</br>
<span >
  Responses that are not appropriate acknowledgements make it seem like the speaker ignored their partner.
</span>
<br >
</br>
<br >
</br>
<span >
  Note that there are some contexts that do not require an acknowledgement in the response, usually because the previous turn did not present any new ideas or questions.
</span>
<br >
</br>
<br >
</br>
<span >
  <b>2. Topic Switches</b>
</span>
<br >
</br>
<br >
</br>
<span >
  A topic switch occurs when the response causes the conversation to focus on a new topic or idea that is not a subpoint of the current discussion topic.
</span>
<br >
</br>
<br >
</br>
<span >
  If a new talking point is introduced but it fits under the current overall topic of the conversation, then this is not a topic switch.
</span>
<br >
</br>
<br >
</br>
<span >
  If the response only presents ideas, questions, or information that are directly following up on specific questions or ideas presented in the previous turn, then this is also not a topic switch.
</span>
<br >
</br>
<br >
</br>
<span >
  <b>3. Relevance</b>
</span>
<br >
</br>
<br >
</br>
<span >
  A response is appropriately relevant to the dialogue when it continues the current discussion or naturally transitions to a new topic of conversation.
</span>
<br >
</br>
<br >
</br>
<span >
  Responses that are not appropriately relevant feel abrupt and interrupt the discussion, usually because they present questions or ideas that are unrelated to the previous turn.
</span>

</div>
)
}
export { get_transitions_instructions };