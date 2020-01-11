import React, {Component} from 'react';
import './photos.css'
import PhotosAPI from "./PhotosAPI";

const dateOpts = {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'};
function niceDate(datestr) {
    return (new Date(datestr).toLocaleDateString(undefined, dateOpts));
}

function PhotoBox(props) {

    return (
        <div className="column is-one-third">
            <div className="card">
                <div className="card-image">
                    <figure className="image">
                        <img
                            src={PhotosAPI.getPhotoUrl(props.photo)}
                            alt={props.photo.filename}
                            onClick={props.onClick}
                            style={{minHeight: 100, width: "100%"}}
                        />
                    </figure>
                </div>

                <div className="card-footer is-overlay" style={{alignItems: "flex-end"}}>
                    <div className="hover-overlay" style={{width: "100%"}}>
                        <span className="has-text-white has-shadow has-text-weight-bold is-pulled-left"
                              style={{marginLeft: "0.5em"}}>
                            <p className="is-size-7">{props.photo.filename}</p>
                            <p className="is-size-7">{niceDate(props.photo.capture_date)}</p>
                        </span>

                        <span className="has-text-white icon is-medium is-pulled-right"
                              style={{justifyContent: "flex-end"}}>
                            <i className="fas fa-folder" style={{margin: "0em 0.5em"}}/>
                            <i className="fas fa-arrow-alt-circle-down" style={{margin: "0em 0.5em"}}/>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PhotoBox;