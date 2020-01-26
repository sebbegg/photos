import React, { useEffect, useState } from "react";
import _ from "lodash";
import PhotosAPI from "./PhotosAPI";

function updated(o, key, value) {
    return _.set(_.clone(o), key, value);
}

function AlbumCreator(props) {
    const [album, setAlbum] = useState({ name: "", description: "" });
    const [mode, setMode] = useState("invalid");
    const [existingAlbums, setExistingAlbums] = useState([]);

    const button = {
        invalid: { onClick: undefined, text: "Create Album", classes: "is-primary" },
        valid: { onClick: createAlbum, text: "Create Album", classes: "is-primary" },
        loading: { onClick: createAlbum, text: "", classes: "is-loading" },
        done: { onClick: props.close, text: "Finish", classes: "is-success" }
    }[mode];

    function createAlbum() {
        console.log("Creating album: " + JSON.stringify(album));
        setMode("loading");
        PhotosAPI.createAlbum(album.name, album.description)
            .then(res => {
                if (!res.ok) {
                    console.log("Response status: " + res.status);
                }
            })
            .then(() => setMode("done"))
            .catch(err => console.log(err));
    }

    function doClose() {
        // reset state
        setAlbum({ name: "", description: "" });
        setMode("invalid");
        props.close();
    }

    useEffect(() => {
        PhotosAPI.getAlbums().then(albums => setExistingAlbums(albums.map(a => a.name)));
    }, []);

    const albumExists = existingAlbums.indexOf(album.name) !== -1;
    useEffect(() => {
        let valid = true;
        if (album.name.length < 5 || albumExists) {
            valid = false;
        }
        setMode(valid ? "valid" : "invalid");
    }, [album, albumExists, existingAlbums]);

    let help = { classes: "is-success", text: "That album name is fine!" };
    if (albumExists) {
        help = { classes: "is-danger", text: "That album name already exists." };
    } else if (album.name.length > 0 && album.name.length < 5) {
        help = { classes: "is-danger", text: "That album name is too short." };
    } else if (album.name.length === 0) {
        help.classes = "is-hidden";
    }

    return (
        <div className={"modal " + (props.active ? " is-active" : "")}>
            <div className="modal-background" />
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">New Album</p>
                    <button className="delete" aria-label="close" onClick={doClose} />
                </header>
                <section className="modal-card-body">
                    <div className="field">
                        <label className="label">Name</label>
                        <div className="control has-icons-right">
                            <input
                                className="input"
                                type="text"
                                placeholder="Album name"
                                value={album.name}
                                onChange={e => setAlbum(updated(album, "name", e.target.value))}
                                disabled={mode === "done"}
                            />
                            {mode === "valid" && (
                                <span className="icon is-small is-right has-text-success">
                                    <i className="fas fa-check" />
                                </span>
                            )}
                        </div>
                        <p className={"help " + help.classes}>{help.text}</p>
                    </div>
                    <div className="field">
                        <label className="label">Description</label>
                        <div className="control">
                            <textarea
                                className="textarea"
                                placeholder="Description"
                                onChange={e =>
                                    setAlbum(updated(album, "description", e.target.value))
                                }
                                disabled={mode === "done"}
                            />
                        </div>
                    </div>
                </section>
                <footer className="modal-card-foot">
                    <button
                        className={"button " + button.classes}
                        onClick={button.onClick}
                        disabled={button.onClick === undefined}
                    >
                        {button.text}
                    </button>
                    <button className="button" onClick={doClose}>
                        Cancel
                    </button>
                </footer>
            </div>
        </div>
    );
}

export { AlbumCreator };
