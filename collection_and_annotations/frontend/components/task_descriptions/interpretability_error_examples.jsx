import React from "react";
function get_interpretability_error_examples() {
return (
<div>
<code >
  <span className="sam-response" >
    Sam:  I saw a great movie yesterday.
  </span>
  <span className="alex-response" >
    Alex: I like.
  </span>
</code>
<br >
</br>
<span >
  <b>Uninterpretable</b>: Alex's response is incomplete.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="sam-response" >
    Sam:  I think pizza is the best food.
  </span>
  <span className="alex-response" >
    Alex: No, ramen.
  </span>
</code>
<br >
</br>
<span >
  <b>Not uninterpretable</b>: Even though Alex's response is not a complete sentence, it represents a complete thought ("No, ramen is the best food") because of the context.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="alex-response" >
    Alex: I just got back from swimming at the beach but I haven't left my house yet today so I haven't gone swimming yet.
  </span>
</code>
<br >
</br>
<span >
  <b>Not uninterpretable</b>: It is possible to understand what Alex is saying even if that meaning doesn't make logical sense due to <br/> her contradicting herself by saying both she has swam today and that she hasn't swam today. Illogical meanings <br/> are not marked as uninterpretable.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="alex-response" >
    Alex: I think pizza is the glorpba food.
  </span>
</code>
<br >
</br>
<span >
  <b>Uninterpretable</b>: "glorpba" is not a meaningful word.
</span>
<br >
</br>
<hr >
</hr>
<code >
  <span className="alex-response" >
    Alex: That movie was nonsense.
  </span>
  <span className="sam-response" >
    Sam:  I couldn't even tell you what happened.
  </span>
  <span className="alex-response" >
    Alex: It was nondescribable.
  </span>
</code>
<br >
</br>
<span >
  <b>Not uninterpretable</b>: Even though "nondescribable" is not recognized as a word in the English standard vocabulary ("indescribable" is technically correct), it is fully interpretable and meaningful in the context. Slang words, onomatopoeias, and novel words are not considered grammar errors if they are easily and fully interpretable.
</span>
<br >
</br>

</div>
)
}
export { get_interpretability_error_examples };