import React from "react";
import "bulma/css/bulma.css";
import PhotosView from "./photosview";
import { useLocation } from "react-router-dom";

function Gallery(props) {
    let location = useLocation();
    let p = new URLSearchParams(location.search);

    return (
        <div>
            <PhotosView
                albumName={p.get("album")}
                camera={p.get("camera")}
                min_date={p.get("minDate")}
                max_date={p.get("maxDate")}
            />
        </div>
    );
}

export default Gallery;
