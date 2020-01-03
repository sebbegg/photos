import React, { Component } from 'react';

class Toolbar extends Component {

  render() {
    return (
      <div className="pure-g">
        <div className="pure-u-1-1">
          <aside style={{textAlign: "right", margins: "0em 1em", color: "white", textDecoration: "none", fontSize: "150%"}}>
            <span>
              <a href="#">
                <i className="fas fa-cogs"></i>
              </a>
              <a href="#">
                <i class="fas fa-filter"></i>
              </a>
              <a href="#">
                <i className="far fa-arrow-alt-circle-down"></i>
              </a>
            </span>
          </aside>
        </div>
      </div>
    );
  }
}

export default Toolbar;