import pathlib

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from photos.model import Db

TEST_IMAGES = pathlib.Path(__file__).parent / "some_images"


@pytest.fixture(scope="session")
def db_engine():
    engine = create_engine("sqlite://", echo=True)
    Db.metadata.create_all(engine)
    return engine


@pytest.fixture()
def db_session(db_engine):
    return sessionmaker(db_engine)()
