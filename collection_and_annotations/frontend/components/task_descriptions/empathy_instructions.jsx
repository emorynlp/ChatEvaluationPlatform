import React from "react";
function get_empathy_instructions() {
return (
<div>
<span >
  Identify responses where the speaker shows an understanding--or lack of understanding--of someone's emotions, <br/> especially the emotions of the person they are talking to.
</span>
<br >
</br>
<br >
</br>
<span >
  A response shows empathy when the speaker:
</span>
<ul >
  <li >
    clearly demonstrates an understanding of their partner's emotions
  </li>
  <li >
    reacts with the appropriate sentiment or emotion to their partner's shared experience
  </li>
  <li >
    understands or appropriately reacts to someone else's experience or emotions
  </li>
  <li >
    appropriately reassures, encourages, or supports their partner
  </li>
</ul>
<br >
</br>
<br >
</br>
<span >
  A response displays a lack of empathy when:
</span>
<ul >
  <li >
    the tone, emotion, or sentiment of the response is clearly inappropriate OR
  </li>
  <li >
    the response has an inappropriate lack of emotion
  </li>
</ul>
<br >
</br>
<br >
</br>
<span >
  It is possible for a response to be neutral, and neither show an understanding nor be missing an understanding of emotions. <br/> In this case, neither category should be selected for the response.
</span>

</div>
)
}
export { get_empathy_instructions };