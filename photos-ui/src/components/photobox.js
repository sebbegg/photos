import React, { useEffect, useState } from "react";
import "../css/photos.css";
import PhotosAPI from "./PhotosAPI";
import { DropDown, DropDownItem } from "./bulma";
import { IconButton, niceDate } from "./utils";
import _ from "lodash";

function PhotoAlbumDropDown(props) {
    const [active, setActive] = useState(false);
    const [albums, setAlbums] = useState([]);
    const [activeAlbums, setActiveAlbums] = useState([]);
    const toggleDropDown = () => setActive(!active);

    useEffect(() => {
        if (active) {
            PhotosAPI.getAlbums().then(setAlbums);
            setActiveAlbums(_.clone(props.photo.albums.map(a => a.id)));
        } else {
            setAlbums([]);
            setActiveAlbums([]);
        }
    }, [active, props.photo]);

    function handleOnChange(e, album) {
        console.log("New state: " + e.target.checked);

        let request = null;
        if (e.target.checked) {
            request = PhotosAPI.addPhotoToAlbum(props.photo, album);
        } else {
            request = PhotosAPI.removePhotoFromAlbum(props.photo, album);
        }
        request.then(photo => {
            console.log("Updated photo: " + JSON.stringify(photo));
            setActiveAlbums(photo.albums.map(a => a.id));
        });
    }

    let elems = [];
    if (active) {
        elems = albums.map(a => {
            return (
                <DropDownItem key={a.name}>
                    <label className="checkbox" htmlFor={a.name}>
                        <input
                            id={a.name}
                            type="checkbox"
                            checked={activeAlbums.indexOf(a.id) !== -1}
                            style={{ marginRight: "1em" }}
                            onChange={e => handleOnChange(e, a)}
                        />
                        {a.name}
                    </label>
                </DropDownItem>
            );
        });
    }

    return (
        <DropDown
            active={active}
            trigger={IconButton({ icon: "fa-folder", onClick: toggleDropDown })}
            onMouseLeave={() => setActive(false)}
        >
            {elems}
        </DropDown>
    );
}

function PhotoBox(props) {
    return (
        <div className="column is-6-tablet is-4-desktop is-3-widescreen is-2-fullhd">
            <div className="card">
                <div className="card-image">
                    <figure className="image">
                        <img
                            src={PhotosAPI.getPhotoUrl(props.photo)}
                            alt={props.photo.filename}
                            onClick={props.onClick}
                            style={{ minHeight: 100, width: "100%" }}
                        />
                    </figure>
                </div>

                <div className="card-footer is-overlay" style={{ alignItems: "flex-end" }}>
                    <div className="hover-overlay" style={{ width: "100%" }}>
                        <span
                            className="has-text-white has-shadow has-text-weight-bold is-pulled-left"
                            style={{ marginLeft: "0.5em" }}
                        >
                            <p className="is-size-7">{props.photo.filename}</p>
                            <p className="is-size-7">{niceDate(props.photo.capture_date)}</p>
                        </span>

                        <span
                            className="has-text-white icon is-medium is-pulled-right"
                            style={{ justifyContent: "flex-end" }}
                        >
                            <PhotoAlbumDropDown photo={props.photo} />
                            <IconButton
                                icon="fa-arrow-alt-circle-down"
                                href={PhotosAPI.getPhotoDownloadUrl(props.photo)}
                            />
                            <IconButton icon="fa-info-circle" />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PhotoBox;
