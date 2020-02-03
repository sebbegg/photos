import pathlib

from flask import Blueprint, g, request, make_response
from flask_restplus import Resource, Namespace, fields

from photos.model import Photo, SourceFolder
from photos.scanner import ImageScanner

sources_blueprint = Blueprint("sources", __name__)
ns = Namespace("sources")

folder_fields = ns.model("SourceFolder", {"folder": fields.String, "stats": fields.Raw})


@ns.route("/_scan")
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


def normalize_folder(f):
    return str(pathlib.Path(f))


@ns.route("/", defaults={"folder": None})
@ns.route("/<string:folder>")
class SourceFolders(Resource):
    @ns.expect(folder_fields, validate=True)
    def post(self, folder):
        folder = normalize_folder(folder or request.get_json()["folder"])
        g.session.add(SourceFolder(folder=folder))
        response = make_response("", 201)
        return response

    @ns.marshal_with(folder_fields)
    def get(self, folder):
        if folder:
            return g.session.query(SourceFolder).get(folder)
        else:
            return g.session.query(SourceFolder).all()
