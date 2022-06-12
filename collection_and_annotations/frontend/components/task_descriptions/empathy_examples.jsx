import React from "react";
function get_empathy_examples() {
return (
<div>
<code >
  <span className="sam-response" >
    Sam:  I graduated college last week, so I've been celebrating.
  </span>
  <span className="alex-response" >
    Alex: I'm sorry to hear that.
  </span>
</code>
<br >
</br>
<span >
  <b>Lack of Empathy</b>: Alex's response attempts to sympathize with Sam, which is inappropriate because Sam is sharing good news.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  I graduated college last week, so I've been celebrating.
  </span>
  <span className="alex-response" >
    Alex: Congratulations!
  </span>
</code>
<br >
</br>
<span >
  <b>Empathy</b>: Alex's response appropriately congratulates Sam, demonstrating an understanding that Sam feels accomplished.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  My dog passed away last week.
  </span>
  <span className="alex-response" >
    Alex: Was your dog long-haired or short-haired?
  </span>
</code>
<br >
</br>
<span >
  <b>Lack of empathy</b>: Alex's response has an inappropriate lack of emotion, and does not sufficiently acknowledge or sympathize with Sam's bad news.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  I took a walk today in the park near my house.
  </span>
  <span className="alex-response" >
    Alex: Oh my gosh.
  </span>
</code>
<br >
</br>
<span >
  <b>Lack of empathy</b>: Sam did not state or imply an emotion, so Alex's emotional reaction is inappropriate.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  I took a walk today in the park near my house.
  </span>
  <span className="alex-response" >
    Alex: Okay.
  </span>
</code>
<br >
</br>
<span >
  <b>Neither empathy nor lack of empathy</b>: Sam did not state or imply an emotion, so an empathetic response is not expected.
</span>
<br >
</br>

</div>
)
}
export { get_empathy_examples };