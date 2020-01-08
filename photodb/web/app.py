from flask import Flask, g, current_app
from flask_cors import CORS

from sqlalchemy import create_engine
from .resources import all_blueprints
from photodb.model import Db

from sqlalchemy.orm import sessionmaker


def new_session():
    g.session = current_app.sessionfactory()


def close_session(response):
    g.session.commit()
    g.session.close()
    return response


def create_app():

    app = Flask("photosdb")
    from werkzeug.contrib.fixers import ProxyFix

    app.wsgi_app = ProxyFix(app.wsgi_app)

    # allow CORS
    CORS(app)

    for blueprint in all_blueprints:
        print("Registering blueprint: %s" % blueprint.name)
        app.register_blueprint(blueprint)

    app.before_request(new_session)
    app.after_request(close_session)

    app.config.from_mapping(SCAN_FOLDERS=["/Users/sebastianeckweiler/Pictures/Irland"])

    engine = create_engine("sqlite:///photosdb.sqlite")
    app.sessionfactory = sessionmaker(engine)
    Db.metadata.create_all(engine)
    return app
