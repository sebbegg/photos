import moment from "moment";

function getParams() {

}

function withQueryParam(location, params) {
    let current = new URLSearchParams(location.search);
    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            current.delete(key);
        } else {
            current.set(key, value);
        }
    });
    return `${location.pathname}?${current.toString()}`
}

function getPhotosOpts(location) {
    let p = new URLSearchParams(location.search);
    let options = {};
    ["album", "camera"].map((key) => {
        let val = p.get(key);
        if (val !== undefined && val !== null) {
            options[key] = val;
        }
    });

    return options;
}

function prettyDateRange(minDate, maxDate, fmt="LL") {
    if (!maxDate || !minDate) {
        return [undefined, undefined]
    }

    const a = moment(minDate);
    const b = moment(maxDate);

    if (b.isSame(moment(), "day")) {
        return [a.fromNow(), "Today"];
    } else {
        return [a.format(fmt), b.format(fmt)];
    }
}

export {withQueryParam, getPhotosOpts, prettyDateRange};