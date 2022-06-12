
import React from "react";

function collapsibleClick(evt) {
    let btn = evt.target;

    const all_collapsibles = document.querySelectorAll('.collapsible'); // close all collapsibles
    all_collapsibles.forEach(deet=>{
        if (deet !== btn) {
            deet.classList.remove("active")
            var content = deet.nextElementSibling;
            content.style.maxHeight = null;
        }
    })

    btn.classList.toggle("active")
    var content = btn.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
}

export { collapsibleClick };