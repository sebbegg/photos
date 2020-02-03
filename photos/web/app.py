from flask import Flask, g, current_app
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from photos import config
from photos.model import Db
from .resources import react_blueprint, photos_blueprint


def new_session():
    g.session = current_app.sessionfactory()


def close_session(response):
    g.session.commit()
    g.session.close()
    return response


def create_app():

    app = Flask("photos", config.STATIC_FOLDER)
    from werkzeug.contrib.fixers import ProxyFix

    app.wsgi_app = ProxyFix(app.wsgi_app)

    app.register_blueprint(react_blueprint, url_prefix="/ui")
    app.register_blueprint(photos_blueprint, url_prefix="/api")

    app.before_request(new_session)
    app.after_request(close_session)

    engine = create_engine(config.DB_URL)
    app.sessionfactory = sessionmaker(engine)
    Db.metadata.create_all(engine)

    return app
