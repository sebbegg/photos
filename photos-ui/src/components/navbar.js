import React, {useEffect, useState} from 'react';
import PhotosAPI from "./PhotosAPI";
import {Link, useLocation} from "react-router-dom";

function Navbar(props) {

    function setAlbumFilter() {

    }

    const [albums, setAlbums] = useState([]);
    const params = new URLSearchParams(useLocation().search);

    const albumElems = albums.map(a => {
        return <Link className={"navbar-item " + (a.name === params.get("album") ? "is-active" : "")} key={a.id}
                     to={loc => `${loc.pathname}?album=${encodeURIComponent(a.name)}`}>{a.name}</Link>;
    });

    useEffect(() => PhotosAPI.getAlbums().then(setAlbums), []);

    return (
        <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                <a className="navbar-item" href="https://bulma.io">
                    <img src="https://bulma.io/images/bulma-logo.png" alt="logo" width="112" height="28"/>
                </a>

                <a role="button" className="navbar-burger burger" aria-label="menu" aria-expanded="false"
                   data-target="navbarBasicExample">
                    <span aria-hidden="true"/>
                    <span aria-hidden="true"/>
                    <span aria-hidden="true"/>
                </a>
            </div>

            <div id="navbarBasicExample" className="navbar-menu">
                <div className="navbar-start">
                    <a className="navbar-item">
                        Home
                    </a>
                    <a className="navbar-item">
                        Documentation
                    </a>
                    <div className="navbar-item has-dropdown is-hoverable">
                        <a className="navbar-link">
                            Albums
                        </a>
                        <div className="navbar-dropdown">
                            {albumElems}
                            <hr className="navbar-divider"/>
                            <Link className={"navbar-item" + (params.get("album") ? "" : " is-active")}
                                  to={loc => `${loc.pathname}`}>
                                All
                            </Link>
                            <a className="navbar-item">
                                New Album…
                            </a>
                        </div>
                    </div>
                </div>

                <div className="navbar-end">
                    <div className="navbar-item">
                        <div className="buttons">
                            <a className="button is-primary">
                                <strong>Button A</strong>
                            </a>
                            <a className="button is-light">
                                Button B
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;