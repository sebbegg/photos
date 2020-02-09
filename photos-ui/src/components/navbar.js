import React, { useEffect, useState } from "react";
import PhotosAPI from "./PhotosAPI";
import { Link, useHistory, useLocation } from "react-router-dom";
import { prettyDateRange, withQueryParam } from "./utils";
import bulmaCalendar from "bulma-extensions/bulma-calendar/dist/js/bulma-calendar.min.js";
import "bulma-extensions/bulma-calendar/dist/css/bulma-calendar.min.css";
import { AlbumCreator } from "./modals";
import _ from "lodash";

function makeNavbarElems(location, objects, queryParam, displayProp = "name", queryProp = "name") {
    const params = new URLSearchParams(location.search);
    return objects.map(o => {
        return (
            <Link
                className={
                    "navbar-item " + (o[queryProp] === params.get(queryParam) ? "is-active" : "")
                }
                key={o[queryProp]}
                to={loc => withQueryParam(loc, { [queryParam]: o[queryProp] })}
            >
                {o[displayProp]}
            </Link>
        );
    });
}

function NavbarDropDown(props) {
    const [active, setActive] = useState(false);

    return (
        <div className={"navbar-item has-dropdown" + (active ? " is-active" : "")}>
            <a className="navbar-link" onClick={() => setActive(!active)}>
                {props.title}
            </a>
            <div
                className="navbar-dropdown"
                onMouseLeave={() => setActive(false)}
                onClick={() => setActive(false)}
            >
                {props.children}
            </div>
        </div>
    );
}

function Navbar(props) {
    const [albums, setAlbums] = useState([]);
    const [cameras, setCameras] = useState([]);
    const [calendar, setCalendar] = useState(null);
    const location = useLocation();
    const params = new URLSearchParams(location.search);

    const albumElems = makeNavbarElems(location, albums, "album");
    const cameraElems = makeNavbarElems(location, cameras, "camera", "name", "id");

    const [albumCreatorActive, setAlbumCreatorActive] = useState(false);
    const closeAlbumCreator = () => {
        setAlbumCreatorActive(false);
    };

    useEffect(() => {
        PhotosAPI.getAlbums().then(setAlbums);
    }, []);
    useEffect(() => {
        PhotosAPI.getDistinctCameras()
            .then(cameras =>
                cameras.map(cam => {
                    return { id: cam.name, name: _.upperFirst(cam.name.replace("/", " ")) };
                })
            )
            .then(setCameras);
    }, []);

    const history = useHistory();

    // initialize calender
    useEffect(() => {
        const calendars = bulmaCalendar.attach('[type="date"]');
        // Loop on each calendar initialized
        calendars.forEach(cal => {
            setCalendar(cal);
            cal.on("select clear", () => {
                history.push(
                    withQueryParam(location, {
                        minDate: cal.startDate && cal.startDate.toISOString().slice(0, 10),
                        maxDate: cal.endDate && cal.endDate.toISOString().slice(0, 10)
                    })
                );
            });
        });
    }, []);

    let minDateStr,
        maxDateStr = null;
    if (calendar) {
        [minDateStr, maxDateStr] = prettyDateRange(calendar.startDate, calendar.endDate);
    }
    return (
        <nav className="navbar" role="navigation" aria-label="main navigation">
            <AlbumCreator active={albumCreatorActive} close={closeAlbumCreator} />
            <div className="navbar-brand">
                <a className="navbar-item" href="#">
                    {/*<img src="https://bulma.io/images/bulma-logo.png" alt="logo" width="112" height="28"/>*/}
                    <p>Fotos</p>
                </a>

                <a
                    role="button"
                    className="navbar-burger burger"
                    aria-label="menu"
                    aria-expanded="false"
                    onClick={e => {
                        document.getElementById("navbar").classList.toggle("is-active");
                        e.target.classList.toggle("is-active");
                    }}
                >
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                </a>
            </div>

            <div id="navbar" className="navbar-menu">
                <div className="navbar-start">
                    <NavbarDropDown title="Albums">
                        <Link
                            className={"navbar-item" + (params.get("album") ? "" : " is-active")}
                            to={loc => withQueryParam(loc, { album: null })}
                        >
                            All
                        </Link>
                        <a className="navbar-item" onClick={() => setAlbumCreatorActive(true)}>
                            New Album…
                        </a>
                        {albumElems.length > 0 && <hr className="navbar-divider" />}
                        {albumElems}
                    </NavbarDropDown>
                    <NavbarDropDown title="Cameras">
                        <Link
                            className={"navbar-item" + (params.get("camera") ? "" : " is-active")}
                            to={loc => withQueryParam(loc, { camera: null })}
                        >
                            All
                        </Link>
                        {cameraElems.length > 0 && <hr className="navbar-divider" />}
                        {cameraElems}
                    </NavbarDropDown>
                    <div className="navbar-item has-dropdown is-hoverable">
                        <div className="navbar-link">
                            <a className="icon has-text-grey">
                                <i className="fas fa-calendar-alt" />
                            </a>
                            <div className="is-centered">
                                <div className="has-text-centered is-size-7">{minDateStr}</div>
                                <div className="has-text-centered is-size-7">{maxDateStr}</div>
                            </div>
                        </div>
                        <div className="navbar-dropdown">
                            <div className="navbar-item">
                                <div>
                                    <input
                                        type="date"
                                        data-is-range="true"
                                        data-color="link"
                                        data-display-mode="dialog"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="navbar-end">
                    <div className="navbar-item">
                        <div className="buttons">
                            <Link
                                className="button is-link"
                                to={loc => `/ui/slideshow${loc.search}`}
                            >
                                <i className="fas fa-tv" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
