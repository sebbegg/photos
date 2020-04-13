import React, { useEffect, useState } from "react";
import "bulma/css/bulma.css";
import PhotosAPI from "./PhotosAPI";
import { Link, useLocation } from "react-router-dom";
import { closeFullscreen, getPhotosOpts, openFullscreen } from "./utils";

import _ from "lodash";

const ICON_CLASS = "icon is-large has-text-grey-lighter";

const SlideShowButton = props => {
    return (
        <button className="button slideshow-button" onClick={props.onClick}>
            <span className={ICON_CLASS}>
                <i className={`fas fa-caret-square-${props.dir} fa-3x`} />
            </span>
        </button>
    );
};

const toggleFullHeight = () => {
    ["html", "root", "body"].map(id => {
        return document.getElementById(id).classList.toggle("full-height");
    });
};

const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        openFullscreen(document.getElementById("slideshow"));
    } else {
        closeFullscreen();
    }
};

function SlideShow(props) {
    useEffect(() => {
        console.log("Toggling full-height");
        toggleFullHeight();
        return toggleFullHeight;
    }, []);

    const incrementCurrent = increment => {
        setCurrent(current => {
            let next = current + increment;
            if (next >= photos.length) {
                next = 0;
            }
            if (next < 0) {
                next = photos.length - 1;
            }
            return next;
        });
    };

    const onKeyDown = keyEvent => {
        switch (keyEvent.key) {
            case "ArrowRight":
                incrementCurrent(1);
                break;
            case "ArrowLeft":
                incrementCurrent(-1);
                break;
            default:
                break;
        }
    };

    const [photos, setPhotos] = useState([]);
    const [current, setCurrent] = useState(undefined);
    const location = useLocation();
    const start = parseInt(new URLSearchParams(location.search).get("start"));
    const photoOpts = getPhotosOpts(location.search);

    useEffect(() => {
        let opts = getPhotosOpts(location);
        opts.pagesize = 0;
        PhotosAPI.getPhotos(opts).then(result => {
            if (result === undefined) {
                result = { photos: [] };
            }
            setPhotos(result.photos);
        });
    }, [photoOpts, location]);

    let startIndex = undefined;
    if (current === undefined) {
        if (isNaN(start)) {
            setCurrent(0);
        } else {
            // find start-photo by id
            startIndex = _.findIndex(photos, ["id", start]);
        }
    }

    let photoUrl;
    if (photos.length > 0) {
        let photo;
        if (current === undefined && startIndex !== undefined) {
            photo = photos[startIndex];
            setCurrent(startIndex);
        } else {
            photo = photos[current];
        }
        photoUrl = `url('${PhotosAPI.getPhotoUrl(photo, { size: 0 })}')`;
    }

    // make sure the keyDown-element is focused
    useEffect(() => {
        document.getElementById("focus-elem").focus();
    });

    return (
        <div
            id="slideshow"
            className="full-page-background has-background-black"
            style={{ backgroundImage: photoUrl }}
        >
            <nav
                className="level fading"
                style={{ position: "fixed", left: "12%", right: "12%", padding: "0.5em" }}
            >
                <div className="level-item has-text-centered">
                    <Link
                        className="button is-medium is-icon"
                        to={loc => _.set(loc, "pathname", "/ui/gallery")}
                    >
                        <span className={ICON_CLASS}>
                            <i className="fas fa-home fa-2x" />
                        </span>
                    </Link>
                </div>
                <div className="level-item has-text-centered">
                    <button className="button is-medium is-icon" onClick={toggleFullScreen}>
                        <span className={ICON_CLASS}>
                            <i className="fas fa-expand fa-2x" />
                        </span>
                    </button>
                </div>
            </nav>
            <div
                id="focus-elem"
                className="columns is-gapless is-mobile is-vcentered full-height"
                tabIndex="0"
                onKeyDown={onKeyDown}
            >
                <div className="column is-1">
                    <SlideShowButton dir="left" onClick={() => incrementCurrent(-1)} />
                </div>
                <div className="column is-10"></div>
                <div className="column is-1 is-vcentered">
                    <SlideShowButton dir="right" onClick={() => incrementCurrent(1)} />
                </div>
            </div>
        </div>
    );
}

export default SlideShow;
