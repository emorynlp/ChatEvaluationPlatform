import React from "react";
function get_common_knowledge_contradiction_examples() {
return (
<div>
<code >
  <span className="alex-response" >
    Alex: I went surfing at the lake this weekend.
  </span>
</code>
<br >
</br>
<span >
  <b>Contradiction</b>: surfing generally requires ocean waves, making the claim implausible.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="alex-response" >
    Alex: I think Kanye West has done a great job as president.
  </span>
</code>
<br >
</br>
<span >
  <b>No contradiction</b>: even though the response is factually inaccurate, it does not violate common knowledge. This is because information about Kanye West and the president does not count as common knowledge; most people do not learn who the president is through direct experience (most people learn who the president is through the news or by someone else telling them).
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  I don't like chocolate.
  </span>
</code>
<br >
</br>
<span >
  <b>No contradiction</b>: even though most people learn through experience that chocolate is delicious, Sam is qualified to make a claim about his own preferences. Therefore, the response does not violate commonsense knowledge.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  My high school graduation was last week.
  </span>
  <span className="alex-response" >
    Alex: Oh, I'm sorry to hear that.
  </span>
</code>
<br >
</br>
<span >
  <b>Contradiction</b>: Alex's sympathy is a highly illogical social response to Sam sharing that he graduated, and contradicts the common knowledge that graduating high school is a positive achievement. Given that Alex does not provide additional explanation as to why the sympathy is warranted, it is a violation of commonsense knowledge.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  My high school graduation was last week.
  </span>
  <span className="alex-response" >
    Alex: Oh, I'm sorry to hear that.
  </span>
  <span className="sam-response" >
    Sam:  Why are you sorry?
  </span>
  <span className="alex-response" >
    Alex: Because I think most people are happier during their teenage years, you'll probably miss high school.
  </span>
</code>
<br >
</br>
<span >
  <b>No contradiction</b>: Although Alex's sympathy is not a reasonable social response without explanation, Alex provides a plausible explanation for why the sympathy is appropriate.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="alex-response" >
    Alex: i can understand that . it sounds like you have a lot going on in your life right now .
  </span>
  <span className="sam-response" >
    Sam: No, not really. Why do you say that?
  </span>
  <span className="alex-response" >
    Alex: i just like to think of all the things i ' ve been doing for the better part of my life .
  </span>
</code>
<br >
</br>
<span >
  <b>No contradiction</b>: Although Alex's response does not make sense as an answer to Sam's question, this cannot be explained by a contradiction of common knowledge. Rather, Alex seems to be presenting an off-topic comment.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  Do you like soccer?
  </span>
  <span className="alex-response" >
    Alex: I really like playing midfield, but I don't think I've ever tried playing soccer before.
  </span>
</code>
<br >
</br>
<span >
  <b>Contradiction</b>: Alex's response is illogical and self-contradictory.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  I have a boy and a girl, they're eight and twelve.
  </span>
  <span className="alex-response" >
    Alex: Oh okay. Do you have any kids?
  </span>
</code>
<br >
</br>
<span >
  <b>Contradiction</b>: Alex's question is at odds with the information already presented in the conversation: everyone knows that if you have a boy and a girl, you have two kids.
</span>
<br >
</br>

</div>
)
}
export { get_common_knowledge_contradiction_examples };