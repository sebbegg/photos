import datetime
import os
import pathlib

from sqlalchemy import (
    Column,
    String,
    JSON,
    DateTime,
    BigInteger,
    Integer,
    Table,
    ForeignKey,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

EXIF_DATEFMT = "%Y:%m:%d %H:%M:%S"
EXIF_DATEKEY = "Image DateTime"

Db = declarative_base()


def with_str(cls):
    def make_str(cls, attrs):

        fmt_string = (
            cls.__name__
            + "("
            + ", ".join("{a}={{self.{a}!r}}".format(a=attr.key) for attr in attrs)
            + ")"
        )

        def __str__(self):
            return fmt_string.format(self=self)

        return __str__

    cls.__str__ = make_str(cls, cls.__mapper__.column_attrs)
    return cls


BigInt = BigInteger().with_variant(Integer, "sqlite")


@with_str
class Photo(Db):

    __tablename__ = "photos"

    id: int = Column(BigInt, autoincrement=True, primary_key=True)
    path: str = Column(String)
    filename: str = Column(String)
    exif: dict = Column(JSON)
    capture_date: datetime = Column(DateTime, index=True)
    added_date: datetime = Column(DateTime, index=True, default=datetime.datetime.now)
    thumbnail_data: bytes = Column(String)
    orientation: int = Column(Integer)

    @classmethod
    def from_path_and_exif(cls, path, exif):

        if EXIF_DATEKEY in exif:
            dt = datetime.datetime.strptime(exif[EXIF_DATEKEY], EXIF_DATEFMT)
        else:
            dt = datetime.datetime.fromtimestamp(os.stat(path).st_ctime)

        thumbnail_data = exif.pop("JPEGThumbnail", None)
        orientation = exif.get("Image Orientation", 1)
        path = pathlib.Path(path)
        return cls(
            path=str(path.parent),
            filename=path.name,
            exif=exif,
            capture_date=dt,
            thumbnail_data=thumbnail_data,
            orientation=orientation,
        )


def photo_to_album():
    return Table(
        "photo_to_album",
        Db.metadata,
        Column("photo_id", BigInt, ForeignKey("photos.id"), primary_key=True),
        Column("album_id", BigInt, ForeignKey("albums.id"), primary_key=True),
    )


@with_str
class Album(Db):

    __tablename__ = "albums"

    id: int = Column(BigInt, autoincrement=True, primary_key=True)
    name: str = Column(String(), unique=True)
    description: str = Column(String())

    photos = relationship(Photo, secondary=photo_to_album, backref="albums")
