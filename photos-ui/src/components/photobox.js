import React from "react";
import "../css/photos.css";
import PhotosAPI from "./PhotosAPI";

const dateOpts = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
};

function niceDate(datestr) {
    return new Date(datestr).toLocaleDateString(undefined, dateOpts);
}

function IconButton(props) {
    const iElem = <i className={"fas " + props.icon} />;
    if (props.href !== undefined) {
        return (
            <a className="button has-text-white is-icon" href={props.href}>
                {iElem}
            </a>
        );
    } else {
        return <button className="button has-text-white is-icon">{iElem}</button>;
    }
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
                            <IconButton icon="fa-folder" />
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
