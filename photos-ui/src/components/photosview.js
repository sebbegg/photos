import React, {useEffect, useState} from 'react';
import 'bulma/css/bulma.css'
import PhotoBox from './photobox.js'
import PhotosApi from './PhotosAPI.js'

import _ from "lodash";

function AlbumHeader(props) {
    if (props.album === null) {
        return null;
    }
    const album = props.album;
    const selectedCount = props.count !== album.photo_count ? ` (${props.count} selected)` : "";
    const plural = album.photo_count === 1 ? "" : "s";

    return (
        <div className="container">
            <h1 className="title">{(album.name === "_all") ? "Your Photos" : album.name}</h1>
            <h2 className="subtitle">
                <p>{`${album.photo_count} Photo${plural}${selectedCount}`}</p>
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

    const [state, setState] = useState({photos: [], photos_count: 0, page: 1, page_count: 1, selection: []});
    const [album, setAlbum] = useState(null);

    function handlePhotoClicked(photo_id) {
        let selection = Object.assign({}, state.selection);
        selection[photo_id] = !selection[photo_id];
        setState((state) => _.set(state, "selection", selection));
    }

    useEffect(() => {
        PhotosApi.getAlbum(props.albumName || "_all").then(setAlbum);
    }, [props.albumName]);

    useEffect(() => {
        let options = {};
        if (album !== null && album.name !== "_all") {
            options.album = album.name;
        }
        if (props.camera !== null && props.camera !== undefined) {
            options.camera = props.camera;
        }
        PhotosApi.getPhotos(options).then((result) => {
            if (result === undefined) {
                return;
            }
            setState({
                photos: result.photos,
                page: result.page,
                photos_count: result.photos_count,
                page_count: Math.ceil(result.photos_count / result.page_size),
                selection: result.photos.reduce((a, p) => {
                    a[p.id] = false;
                    return a;
                }, {})
            });
        });
    }, [album, props.camera]);


    return (
        <div>
            <section className="hero is-dark">
                <div className="hero-body">
                    <AlbumHeader album={album} count={state.photos_count}/>
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