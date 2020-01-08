import React, {Component} from 'react';
import 'bulma/css/bulma.css'
import PhotoBox from './photobox.js'
import PhotosApi from './PhotosAPI.js'

class PhotosView extends Component {

    constructor(props) {
        super(props);
        this.state = {photos: [], selection: []};
        this.handlePhotosLoaded = this.handlePhotosLoaded.bind(this);
        this.handlePhotoClicked = this.handlePhotoClicked.bind(this);
        this.photosApi = new PhotosApi();
    }

    componentDidMount() {
        this.loadPhotos();
    }

    loadPhotos() {
        this.photosApi.getPhotos(this.props.options)
            .then(this.handlePhotosLoaded);
    }

    handlePhotosLoaded(photos) {
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

    render() {

        return (
            <div>
                <div className="columns is-multiline">
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