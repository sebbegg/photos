import moment from "moment";
import React from "react";

function getParams() {}

function withQueryParam(location, params) {
    let current = new URLSearchParams(location.search);
    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            current.delete(key);
        } else {
            current.set(key, value);
        }
    });
    return `${location.pathname}?${current.toString()}`;
}

function getPhotosOpts(location) {
    let p = new URLSearchParams(location.search);
    let options = {};
    ["album", "camera"].map(key => {
        let val = p.get(key);
        if (val !== undefined && val !== null) {
            options[key] = val;
        }
    });

    return options;
}

function prettyDateRange(minDate, maxDate, fmt = "LL") {
    if (!maxDate || !minDate) {
        return [undefined, undefined];
    }

    const a = moment(minDate);
    const b = moment(maxDate);

    if (b.isSame(moment(), "day")) {
        return [a.fromNow(), "Today"];
    } else {
        return [a.format(fmt), b.format(fmt)];
    }
}

export function IconButton(props) {
    const iElem = <i className={"fas " + props.icon} />;

    if (props.href !== undefined) {
        return (
            <a className="button has-text-white is-icon" {...props}>
                {iElem}
            </a>
        );
    } else {
        return (
            <button className="button has-text-white is-icon" {...props}>
                {iElem}
            </button>
        );
    }
}

export { withQueryParam, getPhotosOpts, prettyDateRange };
const dateOpts = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
};

export function niceDate(datestr) {
    return new Date(datestr).toLocaleDateString(undefined, dateOpts);
}

export function openFullscreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        /* IE/Edge */
        elem.msRequestFullscreen();
    }
}

/* Close fullscreen */
export function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        /* Firefox */
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        /* IE/Edge */
        document.msExitFullscreen();
    }
}
