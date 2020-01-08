import io
import os

import PIL.Image
from flask import Blueprint, g, abort, send_file
from flask_restplus import Api, Resource, reqparse, inputs

from photodb.model import Photo, Album
from .utils import sqla_resource_fields

photos_blueprint = Blueprint("photos", __name__)
api = Api(photos_blueprint)
ns = api.namespace("photos")

photos_fields = sqla_resource_fields(Photo)
del photos_fields["thumbnail_data"]
del photos_fields["exif"]

photo_model = ns.model("photo", photos_fields)


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

    parser = reqparse.RequestParser()
    parser.add_argument(
        "size", type=int, default=500, help="Crop image to be at most this many pixels high or wide",
    )
    parser.add_argument(
        "download", type=inputs.boolean, default="false", help="If 'true', return image as attachment",
    )
    parser.add_argument(
        "unmodified", type=inputs.boolean, default="false", help="If true, return unmodified original image",
    )

    def get(self, id: int):
        photo = g.session.query(Photo).get(id)
        if photo is None:
            abort(404, "Photo with id %r not found" % id)

        file_to_send = os.path.join(photo.path, photo.filename)

        args = self.parser.parse_args()
        if not args.unmodified:
            image = PIL.Image.open(file_to_send)
            assert isinstance(image, PIL.Image.Image)

            sz = max(0, args.size)
            if sz < max(image.size):
                image.thumbnail((sz, sz))
            image = normalize_exif_orientation(image, photo.orientation)

            file_to_send = io.BytesIO()
            image.save(file_to_send, "jpeg")
            file_to_send.seek(0)

        return send_file(file_to_send, as_attachment=args.download, attachment_filename=photo.filename)


@ns.route("")
class PhotosList(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument(
        "page", type=int, default=1, help="Page no. to return",
    )
    parser.add_argument(
        "pagesize", type=int, default=20, help="Page size",
    )
    parser.add_argument(
        "album", type=str, default=None, help="Return photos only from album",
    )
    parser.add_argument(
        "camera", type=str, default=None, help="Restrict to photos from the specified camera"
    )
    parser.add_argument(
        "min_date", type=inputs.datetime_from_iso8601, default=None, help="Restrict to photos captured after min_date"
    )
    parser.add_argument(
        "max_date", type=inputs.datetime_from_iso8601, default=None, help="Restrict to photos captured before max_date"
    )

    @api.marshal_with(photo_model)
    def get(self):
        args = self.parser.parse_args()
        offset = (args.page - 1) * args.pagesize

        query = g.session.query(Photo)
        if args.album:
            album = g.session.query(Album).filter(Album.name == args.album).one_or_none()
            if not album:
                abort(404, "Album named %r not found" % args.album)
            query = query.filter(Photo.albums.contains(album))

        if args.camera:
            query = query.filter(Photo.camera == args.camera)

        query = query.order_by(Photo.capture_date.desc()).offset(offset).limit(args.pagesize)
        return query.all()


@ns.route("/cameras")
class PhotoStats(Resource):

    def get(self):
        return [row.camera for row in g.session.query(Photo.camera).distinct()]
