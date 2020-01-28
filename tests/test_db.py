import datetime
import pathlib

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import create_session

from photos.model import Photo, Db
from photos.scanner import ImageScanner

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

    image = Photo(path="some_path", exif={}, datetime=datetime.datetime.now())

    db_session.add(image)
    db_session.flush()


def test_inserts_from_scanner(db_session):

    scanner = ImageScanner(TEST_IMAGES)
    for path, exif_tags in scanner:
        db_session.add(Photo.from_path_and_exif(path, exif_tags))

    db_session.flush()
