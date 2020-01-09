import collections

from flask import Blueprint, g, current_app
from flask_restplus import Api, Resource

from photodb.scanner import ImageScanner
from photodb.model import Photo


scanner_blueprint = Blueprint("scanner", __name__)
api = Api(scanner_blueprint)


@api.route("/scan")
class Scan(Resource):
    def post(self):

        counts = collections.Counter()
        for folder in current_app.config["SCAN_FOLDERS"]:
            scanner = ImageScanner(folder)
            for path, exif in scanner:
                g.session.add(Photo.from_path_and_exif(path, exif))
                counts[folder] += 1

        return counts
