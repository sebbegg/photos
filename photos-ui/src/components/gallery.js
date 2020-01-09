import React, {Component} from 'react';
import 'bulma/css/bulma.css'
import Toolbar from './toolbar.js'
import PhotosView from "./photosview";

class Gallery extends Component {

    constructor(props) {
        super(props);
        this.state = {options: {camera: null}};
    }

    handleToolbarOptionsChanged(toolbarOptions) {
        this.setState({options: toolbarOptions});
    }

    render() {

        let opts = {};
        if (this.state.options.camera !== null) {
            opts.camera = this.state.options.camera.id;
        }

        return (
            <div>
                <Toolbar photosApi={this.photosApi} onOptionsChanged={(o) => this.handleToolbarOptionsChanged(o)}/>
                <PhotosView options={opts}/>
            </div>
        )
    };

}

export default Gallery