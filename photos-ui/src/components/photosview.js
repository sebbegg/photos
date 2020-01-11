import React, {Component} from 'react';
import 'bulma/css/bulma.css'
import PhotoBox from './photobox.js'
import PhotosApi from './PhotosAPI.js'

let _ = require("lodash");

class PhotosView extends Component {

    constructor(props) {
        super(props);
        this.state = {photos: [], selection: []};
        this.handlePhotosLoaded = this.handlePhotosLoaded.bind(this);
        this.handlePhotoClicked = this.handlePhotoClicked.bind(this);
    }

    componentDidMount() {
        this.loadPhotos();
    }

    loadPhotos() {
        PhotosApi.getPhotos(this.props.options)
            .then(this.handlePhotosLoaded);
    }

    handlePhotosLoaded(photos) {
        if (photos === undefined) {
            photos = [];
        }
        this.setState({
            photos: photos,
            selection: photos.reduce((a, p) => {
                a[p.id] = false;
                return a;
            }, {})
        });
    }

    handlePhotoClicked(photo_id) {
        let selection = Object.assign({}, this.state.selection);
        selection[photo_id] = !selection[photo_id];
        this.setState({selection: selection});
    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (!_.isEqual(this.props.options, prevProps.options)) {
            this.loadPhotos();
        }
    }

    render() {

        return (
            <div>
                <div className="columns is-multiline is-vcentered">
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

export default PhotosView