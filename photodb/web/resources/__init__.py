from .albums import albums_blueprint
from .photos import photos_blueprint
from .scanner import scanner_blueprint

all_blueprints = [photos_blueprint, scanner_blueprint, albums_blueprint]
