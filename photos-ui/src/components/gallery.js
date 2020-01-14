import React, {Component} from 'react';
import 'bulma/css/bulma.css'
import Toolbar from './toolbar.js'
import PhotosView from "./photosview";
import {useLocation} from "react-router-dom"

function Gallery(props) {

    let location = useLocation();
    let p = new URLSearchParams(location.search);

    return (
        <div>
            <PhotosView albumName={p.get("album")} camera={p.get("camera")}/>
        </div>
    )

}

export default Gallery