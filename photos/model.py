import datetime
import json
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
    UniqueConstraint,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref

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


_photo_to_album = Table(
    "photo_to_album",
    Db.metadata,
    Column("photo_id", BigInt, ForeignKey("photos.id"), primary_key=True),
    Column("album_id", BigInt, ForeignKey("albums.id"), primary_key=True),
)


@with_str
class SourceFolder(Db):

    __tablename__ = "sourcefolders"

    id: int = Column(Integer, primary_key=True, autoincrement=True)
    folder: str = Column(String, unique=True)
    _stats: str = Column("stats", String, default=None)

    @property
    def stats(self):
        return json.loads(self._stats) if self._stats else None

    @stats.setter
    def stats(self, value):
        self._stats = json.dumps(value)


@with_str
class Album(Db):

    __tablename__ = "albums"

    id: int = Column(BigInt, autoincrement=True, primary_key=True)
    name: str = Column(String(), unique=True)
    description: str = Column(String())
    added_date: datetime.datetime = Column(DateTime, default=datetime.datetime.now)
    modified_date: datetime.datetime = Column(DateTime, default=datetime.datetime.now)

    def set_modified(self):
        self.modified_date = datetime.datetime.now()


@with_str
class Photo(Db):

    __tablename__ = "photos"
    __table_args__ = (UniqueConstraint("path", "filename", name="fullpath"),)

    id: int = Column(BigInt, autoincrement=True, primary_key=True)
    added_date: datetime.datetime = Column(DateTime, index=True, default=datetime.datetime.now)
    modified_date: datetime.datetime = Column(DateTime, default=datetime.datetime.now, index=True)

    path: str = Column(String)
    filename: str = Column(String)
    exif: dict = Column(JSON)
    capture_date: datetime = Column(DateTime, index=True)
    thumbnail_data: bytes = Column(String)
    orientation: int = Column(Integer)
    camera: str = Column(String, index=True)

    albums: set = relationship(
        Album,
        secondary=_photo_to_album,
        collection_class=set,
        backref=backref("photos", collection_class=set),
    )

    def set_modified(self):
        self.modified_date = datetime.datetime.now()

    @classmethod
    def from_path_and_exif(cls, path: pathlib.Path, exif):

        if isinstance(path, str):
            path = pathlib.Path(path)

        if EXIF_DATEKEY in exif:
            dt = datetime.datetime.strptime(exif[EXIF_DATEKEY], EXIF_DATEFMT)
        else:
            dt = datetime.datetime.fromtimestamp(path.stat().st_ctime)

        thumbnail_data = exif.pop("JPEGThumbnail", None)
        orientation = exif.get("Image Orientation", 1)
        camera = "/".join((exif.get("Image Make", ""), exif.get("Image Model", "")))
        if camera == "/":
            camera = None

        return cls(
            path=str(path.parent),
            filename=path.name,
            exif=exif,
            capture_date=dt,
            thumbnail_data=thumbnail_data,
            orientation=orientation,
            camera=camera,
        )
