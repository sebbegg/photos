from flask import Blueprint, g
from flask_restplus import Resource, Namespace

from photodb.model import Photo, SourceFolder
from photodb.scanner import ImageScanner

scanner_blueprint = Blueprint("scanner", __name__)
ns = Namespace("scan")


@ns.route("")
class Scan(Resource):
    def post(self):

        counts = dict()
        for source in g.session.query(SourceFolder):

            scanner = ImageScanner(source.folder, last_scan_stats=source.stats)
            counts[source.folder] = 0
            for path, exif in scanner:
                g.session.add(Photo.from_path_and_exif(path, exif))
                counts[source.folder] += 1
            source.stats = scanner.scan_stats

        return counts
