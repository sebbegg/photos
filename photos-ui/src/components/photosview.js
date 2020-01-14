import React, {useEffect, useState} from 'react';
import 'bulma/css/bulma.css'
import PhotoBox from './photobox.js'
import PhotosApi from './PhotosAPI.js'
import {useLocation} from "react-router-dom";


let _ = require("lodash");

function AlbumHeader(props) {
    if (props.album === null) {
        return null;
    }
    const album = props.album;
    return (
        <div className="container">
            <h1 className="title">{(album.name === "_all") ? "Your Photos" : album.name}</h1>
            <h2 className="subtitle">
                <p>{`${album.photo_count} Photo` + (album.photo_count === 1 ? "" : "s")}</p>
                {
                    (album.photo_count > 0) ? (
                        <p>{`${album.min_date} - ${album.max_date}`}</p>
                    ) : (
                        <p></p>
                    )
                }
            </h2>
        </div>
    );

}

function PhotosView(props) {

    const [state, setState] = useState({photos: [], selection: []});
    const [album, setAlbum] = useState(null);
    const loc = useLocation();
    console.log("Rendering photosview for: " + loc.search);

    function handlePhotoClicked(photo_id) {
        let selection = Object.assign({}, state.selection);
        selection[photo_id] = !selection[photo_id];
        console.log("Setting new selection");
        setState({selection: selection});
    }

    useEffect(() => {
        let options = {};
        if (album !== null && album.name !== "_all") {
            options.album = album.name;
        }
        if (props.camera !== null && props.camera !== undefined) {
            options.camera = props.camera;
        }
        PhotosApi.getPhotos(options).then((photos) => {
            if (photos === undefined) {
                photos = [];
            }
            setState({
                photos: photos,
                selection: photos.reduce((a, p) => {
                    a[p.id] = false;
                    return a;
                }, {})
            });
        });
    }, [album]);

    useEffect(() => {
        PhotosApi.getAlbum(props.albumName || "_all").then(setAlbum);
    }, [loc]);

    return (
        <div>
            <section className="hero is-dark">
                <div className="hero-body">
                    <AlbumHeader album={album}/>
                </div>
            </section>
            <div className="columns is-multiline is-vcentered">
                {
                    state.photos.map(
                        (photo) => (
                            <PhotoBox
                                key={photo.id}
                                photo={photo}
                                selected={state.selection[photo.id]}
                                onClick={() => handlePhotoClicked(photo.id)}
                            />
                        )
                    )
                }
            </div>
        </div>
    );
}

export default PhotosView