import sqlalchemy.orm
import sqlalchemy.orm.exc as sa_exc
import sqlalchemy.sql as sa_sql
from flask import Blueprint, g, abort, request, make_response
from flask_restplus import Api, Resource, fields
from werkzeug import urls

from photodb.model import Album, Photo
from .utils import sqla_resource_fields

albums_blueprint = Blueprint("albums", __name__)
api = Api(albums_blueprint)
ns = api.namespace(albums_blueprint.name)

album_fields = sqla_resource_fields(Album)
album_fields["min_date"] = fields.DateTime
album_fields["max_date"] = fields.DateTime
album_fields["photo_count"] = fields.Integer
album_model = ns.model("album", album_fields)


def get_album(session: sqlalchemy.orm.Session, name_or_id):

    if isinstance(name_or_id, str) and all(c.isdigit() for c in name_or_id):
        name_or_id = int(name_or_id, 10)

    if isinstance(name_or_id, int):
        return session.query(Album).get(name_or_id)
    else:
        try:
            return session.query(Album).filter_by(name=name_or_id).one()
        except sa_exc.NoResultFound:
            pass


@ns.route("/<string:name_or_id>")
class Albums(Resource):
    stats_query = sa_sql.select(
        [
            sa_sql.func.count(Photo.id).label("photo_count"),
            sa_sql.func.min(Photo.capture_date).label("min_date"),
            sa_sql.func.max(Photo.capture_date).label("max_date"),
        ]
    )

    @ns.marshal_with(album_model)
    def get(self, name_or_id):

        if name_or_id == "_all":
            query = self.stats_query
            album = Album(name="_all")
        else:
            album = get_album(g.session, urls.url_unquote(name_or_id))
            if album is None:
                abort(404, "Album named %s not found" % name_or_id)

            query = self.stats_query.where(Photo.albums.contains(album))

        stats = g.session.execute(query).first()
        for k, v in stats.items():
            setattr(album, k, v)

        return album


@ns.route("")
class AlbumList(Resource):
    
    @ns.marshal_with(album_model)
    def get(self):
        return g.session.query(Album).all()

    def post(self):
        album_dct = request.get_json()
        album = Album(**album_dct)
        g.session.add(album)
        response = make_response("", 201)
        response.headers["Location"] = f"{request.path}/{urls.url_quote(album.name)}"

        return response
