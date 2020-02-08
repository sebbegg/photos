import logging
import pathlib

from flask import Blueprint, g, request, make_response
from flask_restplus import Resource, Namespace, fields, abort

from photos.model import SourceFolder
from photos.scanner import scan_source_folder

log = logging.getLogger(__name__)

sources_blueprint = Blueprint("sources", __name__)
ns = Namespace("sources")

folder_fields = ns.model("SourceFolder", {"folder": fields.String, "stats": fields.Raw})


@ns.route("/_scan")
class Scan(Resource):
    def post(self):

        counts = dict()
        for source in g.session.query(SourceFolder):
            n_photos = scan_source_folder(g.session, source)
            counts[source.folder] = n_photos

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
            f = g.session.query(SourceFolder).get(folder)
            if f is None:
                abort(404, "Folder not found.")
        else:
            return g.session.query(SourceFolder).all()
