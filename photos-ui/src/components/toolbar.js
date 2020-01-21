import React, { Component } from "react";
import Dropdown from "./dropdown.js";
import PhotosAPI from "./PhotosAPI";

let _ = require("lodash");

class Toolbar extends Component {
    constructor(props) {
        super(props);
        this.state = { options: { camera: null }, choices: { cameras: [] } };
    }

    componentDidMount() {
        PhotosAPI.getDistinctCameras().then(c => this.handleCamerasLoaded(c));
        this.fireOnOptionsChanged(this.state.options);
    }

    handleCamerasLoaded(cameras) {
        this.setState({ choices: { cameras: cameras } });
    }

    handleDropdownChanged(key, data) {
        let state = { options: {} };
        state.options[key] = data;
        this.setState(state);
        this.fireOnOptionsChanged(state.options);
    }

    fireOnOptionsChanged(opts) {
        if (this.props.onOptionsChanged) {
            this.props.onOptionsChanged(_.cloneDeep(opts));
        }
    }

    render() {
        const cameras = this.state.choices.cameras.map(camera => ({ id: camera, text: camera }));

        return (
            <nav className="level">
                <div className="level-left" />
                <div className="level-right">
                    <div className="level-item">
                        <Dropdown
                            items={cameras}
                            icon="fas fa-camera-retro"
                            noSelectionText="All cameras"
                            onSelectionChanged={selection =>
                                this.handleDropdownChanged("camera", selection)
                            }
                        />
                    </div>
                </div>
            </nav>
        );
    }
}

export default Toolbar;
