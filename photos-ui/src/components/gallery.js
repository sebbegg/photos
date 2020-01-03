import React, { Component } from 'react';
import PhotoBox from './photobox.js'
import Toolbar from './toolbar.js'


class Gallery extends Component {

    constructor(props) {
        super(props);
        this.state = {photos: [], selection: []};
        this.handlePhotosLoaded = this.handlePhotosLoaded.bind(this);
        this.handlePhotoClicked = this.handlePhotoClicked.bind(this);
    }

    componentDidMount() {
        fetch('http://localhost:5000/photos/')
        .then(res => res.json())
        .then(this.handlePhotosLoaded)
        .catch(console.log)
    }

    handlePhotosLoaded(photos) {
        this.setState({
            photos: photos,
            selection: photos.reduce((a, p) => { a[p.id] = false; return a;}, {})
        })
    }

    handlePhotoClicked(photo_id) {
        var selection = Object.assign({}, this.state.selection);
        selection[photo_id] = !selection[photo_id]
        this.setState({selection: selection});
    }

    render() {
      return (
        <div>
          <center><h1>My Photos</h1></center>
          <Toolbar />
          <div className="pure-g">
          {
            this.state.photos.map(
              (photo) => (
                <PhotoBox
                key={photo.id}
                photo={photo}
                selected={this.state.selection[photo.id]}
                onClick={() => this.handlePhotoClicked(photo.id)}
                />
              )
            )
          }
          </div>
        </div>
      )
    };

    }

export default Gallery