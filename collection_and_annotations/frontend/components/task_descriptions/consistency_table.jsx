import React from "react";
function get_consistency_table() {
return (
<div>
<table >
  <tbody >
    <tr >
      <td >
        <b >
           Contradicts self context    
        </b>
      </td>
      <td >
         The speaker says something that doesn't make sense, either because it is a contradiction of something they have said previously or it is extremely implausible based on the information they have already shared. 
      </td>
    </tr>
    <tr >
      <td >
        <b >
           Contradicts partner context 
        </b>
      </td>
      <td >
         The turn makes a claim that inappropriately contradicts something Sam has said at any point in the conversation history.                                                                                    
      </td>
    </tr>
    <tr >
      <td >
        <b >
           Redundant                   
        </b>
      </td>
      <td >
         The speaker repeats something either of the speakers has said earlier in the conversation in a clearly inappropriate way.                                                                                         
      </td>
    </tr>
  </tbody>
</table>

</div>
)
}
export { get_consistency_table };