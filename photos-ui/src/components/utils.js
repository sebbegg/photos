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

export {withQueryParam, getPhotosOpts};