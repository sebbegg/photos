import React, { useEffect, useState } from "react";
import "bulma/css/bulma.css";
import _ from "lodash";
import Masonry from "react-masonry-css";

import PhotoBox from "./photobox";
import PhotosApi from "./PhotosAPI";
import PagingControl from "./paging";
import { prettyDateRange } from "./utils";
import "./../css/masonry.css";

const breakpointColumns = {
    default: 5,
    1216: 4,
    1024: 3,
    769: 2,
    500: 1
};

function AlbumHeader(props) {
    if (props.album === null) {
        return null;
    }
    const album = props.album;
    const selectedCount = props.count !== album.photo_count ? ` (${props.count} selected)` : "";
    const plural = album.photo_count === 1 ? "" : "s";
    const [minDateString, maxDateString] = prettyDateRange(album.min_date, album.max_date);

    return (
        <div className="container">
            <h1 className="title">{album.name === "_all" ? "Your Photos" : album.name}</h1>
            <h2 className="subtitle">
                <p>{`${album.photo_count} Photo${plural}${selectedCount}`}</p>
                {album.photo_count > 0 ? <p>{`${minDateString} - ${maxDateString}`}</p> : <p></p>}
            </h2>
        </div>
    );
}

function PhotosView(props) {
    const [state, setState] = useState({
        photos: [],
        photos_count: 0,
        page: 1,
        page_count: 1,
        selection: []
    });
    const [album, setAlbum] = useState(null);
    const [page, setPage] = useState(1);

    function handlePhotoClicked(photo_id) {
        let selection = Object.assign({}, state.selection);
        selection[photo_id] = !selection[photo_id];
        setState(state => _.set(state, "selection", selection));
    }

    useEffect(() => {
        PhotosApi.getAlbum(props.albumName || "_all").then(setAlbum);
    }, [props.albumName]);

    useEffect(() => {
        let options = { page: page, pagesize: 48 };

        if (album !== null && album.name !== "_all") {
            options.album = album.name;
        }
        ["camera", "min_date", "max_date"].forEach(k => {
            if (props[k] !== null && props[k] !== undefined) {
                options[k] = props[k];
            }
        });
        PhotosApi.getPhotos(options).then(result => {
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
    }, [album, props, page]);

    return (
        <div>
            <section className="hero is-dark">
                <div className="hero-body">
                    <AlbumHeader album={album} count={state.photos_count} />
                </div>
            </section>
            <div className="container" style={{ marginTop: "10px" }}>
                <PagingControl
                    pageCount={state.page_count}
                    currentPage={state.page}
                    onClick={page => setPage(page)}
                />
                <Masonry
                    breakpointCols={breakpointColumns}
                    className="masonry-grid"
                    columnClassName="masonry-grid-column"
                >
                    {state.photos.map(photo => (
                        <div key={photo.id}>
                            <PhotoBox
                                photo={photo}
                                selected={state.selection[photo.id]}
                                onClick={() => handlePhotoClicked(photo.id)}
                            />
                        </div>
                    ))}
                </Masonry>
                <PagingControl
                    pageCount={state.page_count}
                    currentPage={state.page}
                    onClick={page => setPage(page)}
                />
            </div>
        </div>
    );
}

export default PhotosView;
