import os
import io

from flask import Blueprint, g, abort, send_file
from flask_restplus import Api, Resource

import PIL.Image

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


_exif_orient_2_rotate = {3: 180, 5: 270, 6: -90, 7: 90, 8: 270}


def normalize_exif_orientation(image: PIL.Image.Image, orientation: int):

    if orientation in (2, 5, 7):
        image = image.transpose(PIL.Image.FLIP_LEFT_RIGHT)

    angle = _exif_orient_2_rotate.get(orientation)
    if angle:
        image = image.rotate(angle, expand=True)

    return image


@ns.route("/<int:id>/file")
class PhotoFiles(Resource):
    def get(self, id: int):
        photo = g.session.query(Photo).get(id)
        assert isinstance(photo, Photo)
        if photo is None:
            abort(404, "Photo with id %r not found" % id)

        path = os.path.join(photo.path, photo.filename)
        image = PIL.Image.open(path)
        assert isinstance(image, PIL.Image.Image)
        image.thumbnail((500, 500))
        image = normalize_exif_orientation(image, photo.orientation)

        print(f"Delivering: {photo.path}/{photo.filename}")
        fp = io.BytesIO()
        image.save(fp, "jpeg")
        fp.seek(0)
        return send_file(fp, attachment_filename=photo.filename)


@ns.route("/")
class PhotosList(Resource):
    @api.marshal_with(photos_fields)
    def get(self):
        result = g.session.query(Photo).order_by(Photo.capture_date.desc()).all()
        return result
