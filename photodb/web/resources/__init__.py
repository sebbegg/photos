from flask import Blueprint
from flask_restplus import Api

from .albums import ns as album_ns
from .photos import ns as photo_ns
from .react import react_blueprint
from .scanner import ns as scanner_ns

photos_blueprint = Blueprint("photos", __name__)
photos_api = Api(photos_blueprint)
photos_api.add_namespace(album_ns)
photos_api.add_namespace(photo_ns)
photos_api.add_namespace(scanner_ns)

__all__ = ["photos_blueprint", "react_blueprint"]