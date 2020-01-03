import React, { Component } from 'react';
import './photos.css'

class PhotoBox extends Component {

  render() {
    return (
      <div className="photo-box pure-u-1-1 pure-u-md-1-2 pure-u-lg-1-3">
          {this.props.selected && <aside className="selection">
              <span>
                  <i className="far fa-check-circle"></i>
              </span>
            </aside>}
          <img className="pure-img"
            src={"http://localhost:5000/photos/" + this.props.photo.id + "/file"}
            alt={this.props.photo.filename}
            onClick={this.props.onClick}
            >
          </img>
          <aside className="menu">
            <span>
              <a href="#">
                <i className="far fa-folder"></i>
              </a>
              <a href={"http://localhost:5000/photos/" + this.props.photo.id + "/file?download=true"}>
                <i className="far fa-arrow-alt-circle-down"></i>
              </a>
            </span>
          </aside>
      </div>
    );
  }
}

export default PhotoBox;