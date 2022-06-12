
import React from "react";

function LeftPane({ stretch = false, children }) {
  let pane_size = stretch ? "col-xs-12" : "col-xs-4";
  return <div id="left-pane" className={pane_size + " left-pane"} style={{ float: 'left', width: '30%', padding: '10px', boxSizing: 'border-box', backgroundColor: '#f2f2f2', height: '100%', overflow: 'scroll' }}>{children}</div>;
}

function RightTopPane({ scrollPaneName, height = '80%', width = '70%', onScroll, children }) {
    let name = scrollPaneName !== undefined ? scrollPaneName : "right-top-pane";
  return <div id={name} className="right-pane"
              style={{ float: 'right', width: width, padding: '20px',
                      boxSizing: 'border-box', height: height, overflow: 'scroll' }}>
            {children}
          </div>;
}

function RightBottomPane({ height = '20%', children }) {
  return <div id="right-bottom-pane" className="right-pane" style={{ float: 'right', width: '70%', padding: '20px', boxSizing: 'border-box', height: height, overflow: 'scroll' }}>{children}</div>;
}

export { LeftPane, RightTopPane, RightBottomPane };