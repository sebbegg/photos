import os
from flask import Blueprint, g, abort, send_file
from flask_restplus import Api, Resource

from photodb.model import Photo
from .utils import sqla_resource_fields

photos_blueprint = Blueprint("photos", __name__)
api = Api(photos_blueprint)
ns = api.namespace("photos")

photos_fields = sqla_resource_fields(Photo)
del photos_fields["thumbnail_data"]
del photos_fields["exif"]


@ns.route("/<int:id>")
class Photos(Resource):
    @ns.marshal_with(photos_fields)
    def get(self, id):
        photo = g.session.query(Photo).get(id)
        if photo is None:
            abort(404, "Photo with id %r not found" % id)
        return photo


@ns.route("/<int:id>/file")
class PhotoFiles(Resource):
    def get(self, id):
        photo = g.session.query(Photo).get(id)
        assert isinstance(photo, Photo)
        if photo is None:
            abort(404, "Photo with id %r not found" % id)

        print(f"Delivering: {photo.path}/{photo.filename}")
        return send_file(os.path.join(photo.path, photo.filename))


@ns.route("/")
class PhotosList(Resource):
    @api.marshal_with(photos_fields)
    def get(self):
        result = g.session.query(Photo).order_by(Photo.capture_date.desc()).all()
        return result
