let apiRoot = "";

function setRoot(root) {
    console.log("Setting root: " + root);
    apiRoot = root;
}

class PhotosAPI {
    static buildURI(resource, options) {
        let uri = "http://localhost:5000/";

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

    static doGet(resource, options) {
        return fetch(this.buildURI(resource, options))
            .then(res => res.json())
            .catch(console.log);
    }

    static doDelete(resource, options) {
        return fetch(this.buildURI(resource, options), { method: "DELETE" })
            .then(res => res.json())
            .catch(console.log);
    }

    static doPost(resource, data, options) {
        let init = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        };
        if (data !== undefined) {
            init.body = JSON.stringify(data);
        }
        return fetch(this.buildURI(resource, options), init)
            .then(res => res.json())
            .catch(console.log);
    }

    static getPhotos(options) {
        return this.doGet("photos", options);
    }

    static getPhotoUrl(photo, options) {
        return this.buildURI("photos/" + photo.id + "/file", options);
    }

    static getPhotoDownloadUrl(photo, options) {
        return this.buildURI("photos/" + photo.id + "/file", { download: "true" });
    }

    static getDistinctCameras() {
        return this.doGet("photos/cameras");
    }

    static getAlbums(options) {
        return this.doGet("albums", options);
    }

    static getAlbum(name, options) {
        return this.doGet(`albums/${encodeURIComponent(name)}`, options);
    }

    static addPhotoToAlbum(photo, album) {
        return this.doPost(
            `photos/${encodeURIComponent(photo.id)}/albums/${encodeURIComponent(album.id)}`
        );
    }

    static removePhotoFromAlbum(photo, album) {
        return this.doDelete(
            `photos/${encodeURIComponent(photo.id)}/albums/${encodeURIComponent(album.id)}`
        );
    }

    static createAlbum(name, description = "") {
        const uri = this.buildURI("albums");
        return fetch(uri, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: name, description: description })
        });
    }
}

export default PhotosAPI;
export { setRoot };
