import io
import os

import PIL.Image
from flask import g, abort, send_file, request
from flask_restplus import Resource, reqparse, inputs, fields, Namespace
from sqlalchemy.orm import joinedload
from sqlalchemy.sql import func
from werkzeug import urls

from photos.model import Photo, Album
from .albums import get_album
from .utils import sqla_resource_fields

ns = Namespace("photos")
album_model = ns.model("Album", sqla_resource_fields(Album))

photos_fields = sqla_resource_fields(Photo)
del photos_fields["thumbnail_data"]
photos_fields["albums"] = fields.List(fields.Nested(album_model))

photo_model = ns.model("Photo", photos_fields)
photo_search = ns.model(
    "SearchResult",
    {
        "page": fields.Integer,
        "page_size": fields.Integer,
        "photos": fields.List(fields.Nested(photo_model)),
        "photos_count": fields.Integer,
    },
)


@ns.route("/<int:id>")
class Photos(Resource):
    @ns.marshal_with(photo_model)
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
        "size", type=inputs.int_range(0, 1_000_000), default=500, help="Scale image to fixed width",
    )
    parser.add_argument(
        "download",
        type=inputs.boolean,
        default=False,
        help="If 'true', return image as attachment",
    )

    @classmethod
    def etag(cls, photo: Photo):

        p = os.path
        filepath = p.join(photo.path, photo.filename)
        return "%s-%s-%s" % (p.getmtime(filepath), p.getsize(filepath), photo.id)

    def get(self, id: int):
        photo = g.session.query(Photo).get(id)
        if photo is None:
            abort(404, "Photo with id %r not found" % id)

        etag = self.etag(photo)
        if etag in request.if_none_match:
            return "", 304

        file_to_send = os.path.join(photo.path, photo.filename)

        args = self.parser.parse_args()
        if not args.download:
            image = PIL.Image.open(file_to_send)
            assert isinstance(image, PIL.Image.Image)

            image = normalize_exif_orientation(image, photo.orientation)
            if 0 < args.size < image.size[0]:
                # fix image width to size:
                w, h = image.size
                image = image.resize(
                    (args.size, round(args.size / w * h)), resample=PIL.Image.BICUBIC
                )

            file_to_send = io.BytesIO()
            image.save(file_to_send, "jpeg")
            file_to_send.seek(0)

        response = send_file(
            file_to_send, as_attachment=args.download, attachment_filename=photo.filename,
        )
        response.set_etag(etag)
        return response


@ns.route("")
class PhotosList(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument(
        "page", type=int, default=1, help="Page no. to return",
    )
    parser.add_argument(
        "pagesize", type=int, default=24, help="Page size",
    )
    parser.add_argument(
        "album", type=str, default=None, help="Return photos only from album",
    )
    parser.add_argument(
        "camera", type=str, default=None, help="Restrict to photos from the specified camera",
    )
    parser.add_argument(
        "min_date",
        type=inputs.datetime_from_iso8601,
        default=None,
        help="Restrict to photos captured after min_date",
    )
    parser.add_argument(
        "max_date",
        type=inputs.datetime_from_iso8601,
        default=None,
        help="Restrict to photos captured before max_date",
    )

    @ns.marshal_with(photo_search)
    def get(self):
        args = self.parser.parse_args()
        offset = (args.page - 1) * args.pagesize
        end = (offset + args.pagesize) if args.pagesize > 0 else None

        query = g.session.query(Photo).options(joinedload(Photo.albums))
        if args.album:
            album = g.session.query(Album).filter(Album.name == args.album).one_or_none()
            if not album:
                abort(404, "Album named %r not found" % args.album)
            query = query.filter(Photo.albums.contains(album))

        if args.camera:
            query = query.filter(Photo.camera == args.camera)

        import datetime

        if args.min_date and args.max_date:
            args.max_date += datetime.timedelta(days=1) - datetime.timedelta(microseconds=1)
            query = query.filter(Photo.capture_date.between(args.min_date, args.max_date))
            print(f"Date range: {args.min_date} - {args.max_date}")

        count_query = g.session.query(func.count(Photo.id))
        if query.whereclause is not None:
            count_query = count_query.filter(query.whereclause)

        return {
            "page": args.page,
            "page_size": args.pagesize,
            "photos_count": count_query.scalar(),
            "photos": query.order_by(Photo.capture_date.desc())[offset:end],
        }


@ns.route("/cameras")
class PhotoStats(Resource):
    def get(self):
        return [
            {"name": row.camera}
            for row in g.session.query(Photo.camera).filter(Photo.camera != None).distinct()  # noqa
        ]


@ns.route("/<int:photo_id>/albums/<string:album_name_or_id>")
class Photos2Albums(Resource):
    @staticmethod
    def get_photo(photo_id: int) -> Photo:

        photo = g.session.query(Photo).get(photo_id)
        if photo is None:
            abort(404, "Photo with id %r not found" % photo_id)

        return photo

    @staticmethod
    def get_album(album_name_or_id) -> Album:

        album = get_album(g.session, urls.url_unquote(album_name_or_id))
        if album is None:
            abort(404, "Album %r not found" % album_name_or_id)
        return album

    @ns.marshal_with(photo_model)
    def post(self, photo_id, album_name_or_id):

        photo = self.get_photo(photo_id)
        album = self.get_album(album_name_or_id)

        if album not in photo.albums:
            album.set_modified()
            photo.albums.add(album)

        return photo

    @ns.marshal_with(photo_model)
    def delete(self, photo_id, album_name_or_id):

        photo = self.get_photo(photo_id)
        album = self.get_album(album_name_or_id)

        if album in photo.albums:
            album.set_modified()
            photo.albums.remove(album)

        return photo
