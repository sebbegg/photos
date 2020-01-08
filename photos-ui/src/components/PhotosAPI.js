class PhotosAPI {

    constructor(host) {
        host = (typeof host !== 'undefined') ? host : "http://localhost:5000";
        if (!host.endsWith("/")) {
            host = host + "/";
        }
        this.host = host;
    }

    buildURI(resource, options) {
        let uri = this.host;

        uri = uri + resource;

        let params = [];
        for (let key in options) {
            params.push(encodeURIComponent(key) + "=" + encodeURIComponent(options[key]));
        }
        if (params.length > 0) {
            uri = uri + "?" + params.join("&");
        }

        return uri;
    }

    buildRequest(resource, options) {
        return fetch(this.buildURI(resource, options))
            .then(res => res.json())
            .catch(console.log);
    }

    getPhotos(options) {
        return this.buildRequest("photos", options);
    }

    getAlbums(options) {
        return this.buildRequest("albums", options);
    }

    getDistinctCameras() {
        return this.buildRequest("photos/cameras");
    }

}

export default PhotosAPI;