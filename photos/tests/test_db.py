import datetime
import pathlib

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import create_session

from photos.model import Photo, Db

TEST_IMAGES = pathlib.Path(__file__).parent / "some_images"


@pytest.fixture(scope="session")
def db_engine():
    engine = create_engine("sqlite://", echo=True)
    Db.metadata.create_all(engine)
    return engine


@pytest.fixture()
def db_session(db_engine):
    return create_session(db_engine, autocommit=True)


def test_insert(db_session):

    image = Photo(path="some_path", exif={}, capture_date=datetime.datetime.now())

    db_session.add(image)
    db_session.flush()

    image2 = db_session.query(Photo).filter(Photo.path == "some_path").one()
    assert image2 is not None
