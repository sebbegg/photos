import os

from flask import Flask, g, current_app
from flask_cors import CORS

from sqlalchemy import create_engine
from .resources import photos_api, react_blueprint, photos_blueprint
from photodb.model import Db

from sqlalchemy.orm import sessionmaker


def new_session():
    g.session = current_app.sessionfactory()


def close_session(response):
    g.session.commit()
    g.session.close()
    return response


def create_app():

    app = Flask("photosdb", static_folder=os.path.join(os.path.dirname(__file__), "static"))
    from werkzeug.contrib.fixers import ProxyFix

    app.wsgi_app = ProxyFix(app.wsgi_app)

    app.register_blueprint(react_blueprint, url_prefix="/ui")
    app.register_blueprint(photos_blueprint, url_prefix="/api")

    app.before_request(new_session)
    app.after_request(close_session)

    engine = create_engine("sqlite:///photosdb.sqlite", echo=True)
    app.sessionfactory = sessionmaker(engine)
    Db.metadata.create_all(engine)

    return app
