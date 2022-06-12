import React from "react";
function get_personal_information_sharing_examples() {
return (
<div>
<code >
  <span className="sam-response" >
    Sam:  What's your favorite movie?
  </span>
  <span className="alex-response" >
    Alex: Probably Inception.
  </span>
</code>
<br >
</br>
<span >
  <b>Preference/value info</b>: Alex is sharing her movie preferences by saying Inception is her favorite movie.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  I got back from Ireland a few days ago.
  </span>
  <span className="alex-response" >
    Alex: Ireland is a great place to take a trip. 
  </span>
</code>
<br >
</br>
<span >
  <b>Preference/value info</b>: Alex shares an attitude towards Ireland.
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
    Alex: I went to the movies today with my friend.
  </span>
</code>
<br >
</br>
<span >
  <b>Life info</b>: Alex is sharing an experience she had.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  I got back from Ireland a few days ago.
  </span>
  <span className="alex-response" >
    Alex: I've always wanted to go to Ireland.
  </span>
</code>
<br >
</br>
<span >
  <b>Preference/value info</b>: The overall intention behind Alex's response is to share her attitude towards Ireland. Even though it also implicitly suggests that Alex has never been to Ireland before, this response should not be marked as sharing about the speaker's life because the speaker's intention is focused on sharing attitudes/preferences.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  What's your favorite movie?
  </span>
  <span className="alex-response" >
    Alex: Probably Inception, I just watched it last night with my friend.
  </span>
</code>
<br >
</br>
<span >
  <b>Preference/value info AND life info</b>: Alex is sharing her movie preferences by saying Inception is her favorite movie, as well as an experience she had.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  Do you have any pets?
  </span>
  <span className="alex-response" >
    Alex: No, but my boyfriend has a German Shepard. He loves dogs.
  </span>
</code>
<br >
</br>
<span >
  <b>Life info</b>: Alex shares that she doesn't have pet and that she does have a boyfriend, which is life information. Note that this is NOT an example of sharing preference/value information; even though Alex shares her boyfriend's preference for dogs, nothing in this example shows a preference or attitude held by Alex herself.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  Gas prices have been going up recently.
  </span>
  <span className="alex-response" >
    Alex: Yeah, I think the conflict between Russia and Ukraine is driving up the price.
  </span>
</code>
<br >
</br>
<span >
  Not preference/value info, not life info: Alex is sharing a thought, but she is not sharing personal information.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  Gas prices have been going up recently.
  </span>
  <span className="alex-response" >
    Alex: Yeah it sucks, I think the conflict between Russia and Ukraine is driving up the price.
  </span>
</code>
<br >
</br>
<span >
  <b>Preference/value info</b>: Alex shares her feelings about gas prices going up.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  My arm's in a cast right now. I fell off my bike like two weeks ago.
  </span>
  <span className="alex-response" >
    Alex: Oh that sucks. I'm sorry that happened to you.
  </span>
</code>
<br >
</br>
<span >
  Not preference/value info, not life info: Alex is reacting to what Sam said, but she is not sharing any specific preference/value information about herself. She is also not revealing any information about her own life.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  I just got back from an amazing vacation to Hawaii.
  </span>
  <span className="alex-response" >
    Alex: That's great!
  </span>
</code>
<br >
</br>
<span >
  Not preference/value info, not life info: Alex shows that she is happy for Sam, but is not sharing meaningful information about her own preferences or attitudes.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  We had eel, it had an interesting taste.
  </span>
  <span className="alex-response" >
    Alex: Ew.
  </span>
</code>
<br >
</br>
<span >
  <b>Preference/value info</b>: Alex reveals her preference against eating eel by having a reaction of disgust.
</span>
<br >
</br>

</div>
)
}
export { get_personal_information_sharing_examples };