import base64
import datetime
import logging
import mimetypes
import os
import pathlib

import attr
import exifread
from sqlalchemy.orm import Session
from sqlalchemy.orm.exc import NoResultFound

import photos.config as config
from photos.model import SourceFolder, Photo, Album

log = logging.getLogger(__name__)

COMMIT_BATCH_SIZE = 100


def _exifread(path: str) -> dict:
    def _plain_value(v):
        if isinstance(v, exifread.IfdTag):
            if isinstance(v.values, list):
                v = [
                    repr(elem) if isinstance(elem, exifread.utils.Ratio) else elem
                    for elem in v.values
                ]
                if len(v) == 1:
                    v = v[0]
            else:
                v = v.values

        if isinstance(v, (str, int, list)):
            return v
        elif isinstance(v, bytes):
            return base64.standard_b64encode(v).decode("ascii")
        else:
            raise TypeError("Not supported: %s" % type(v))

    with open(path, "rb") as fp:
        return {k: _plain_value(v) for k, v in exifread.process_file(fp).items()}


@attr.s
class ImageScanner:

    dirname = attr.ib()
    last_scan_stats = attr.ib(factory=dict)
    scan_stats = attr.ib(factory=dict)

    def __iter__(self) -> (pathlib.Path, dict):

        if self.last_scan_stats is None:
            self.last_scan_stats = {}
        self.scan_stats = self.last_scan_stats.copy()

        try:
            yield from self._scan(self.dirname)
        except FileNotFoundError:
            log.error("Folder not found: %s", self.dirname)

    def _key_for_direntry(self, dirname: str):
        return str(pathlib.Path(dirname).relative_to(self.dirname))

    def _scan(self, dirname) -> (pathlib.Path, dict):

        relative_dir = self._key_for_direntry(dirname)
        last_scanned = self.last_scan_stats.get(relative_dir, 0)
        self.scan_stats[relative_dir] = datetime.datetime.now().timestamp()

        for entry in os.scandir(dirname):
            # skip hidden files/folders
            if entry.name.startswith("."):
                continue

            try:
                stats = entry.stat()
            except FileNotFoundError:
                # not sure why this can happen..., as we're using scandir
                continue

            if stats.st_ctime < last_scanned and stats.st_mtime < last_scanned:
                continue

            if entry.is_file():
                type, enc = mimetypes.guess_type(entry.name)
                if type and type.startswith("image"):
                    yield pathlib.Path(entry.path), _exifread(entry.path)
            elif entry.is_dir():
                yield from self._scan(entry.path)


def folder_to_album_name(folder_name):
    return folder_name.replace("_", " ").strip().title()


def check_create_album(session: Session, folder_name: str):

    album = None
    if config.ALBUM_REGEX.match(folder_name):
        album_name = folder_to_album_name(folder_name)
        try:
            album = session.query(Album).filter_by(name=album_name).one()
        except NoResultFound:
            log.info("Creating new album %s", album_name)
            album = Album(name=album_name)
        else:
            log.info("Using existing album %s", album_name)

    return album


def scan_source_folder(session: Session, source: SourceFolder):

    scanner = ImageScanner(source.folder, last_scan_stats=source.stats)

    n = 0
    # dont create albums from top-level folders
    folders_seen = {pathlib.Path(source.folder)}
    album = None
    for n, (path, exif) in enumerate(scanner):
        assert isinstance(path, pathlib.Path)

        photo = Photo.from_path_and_exif(path, exif)
        session.add(photo)

        # check if the folder qualifies as a album name
        if path.parent not in folders_seen:
            album = check_create_album(session, path.parent.name)
            folders_seen.add(path.parent)

        if album:
            photo.albums.add(album)

        if n > 0 and n % COMMIT_BATCH_SIZE == 0:
            source.stats = scanner.scan_stats
            session.commit()

    if n % COMMIT_BATCH_SIZE:
        source.stats = scanner.scan_stats
        session.commit()

    log.info("Scanner found %d new images." % n)
    return n
