import contextlib
import functools
import datetime
import logging
import os
import json

import click
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import photos.config as config
from photos.model import SourceFolder, Photo
from photos.scanner import ImageScanner

log = logging.getLogger("photos.cli")


@click.group("photos")
def cli():
    pass


@contextlib.contextmanager
def lockfile_context(filename, force=False):

    info = None
    do_delete = False
    if not force:
        try:
            with open(filename, "r", encoding="utf-8") as fp:
                info = json.load(fp)
        except FileNotFoundError:
            pass

    if not info:
        with open(filename, "w", encoding="utf-8") as fp:
            json.dump(
                dict(
                    user=os.getenv("USER"),
                    created_at=datetime.datetime.now().astimezone().isoformat(),
                ),
                fp,
                indent=4,
            )
            log.debug("Created lockfile: %s", filename)
            do_delete = True

    try:
        yield info
    finally:
        if do_delete:
            os.remove(filename)
            log.debug("Cleaned up lockfile: %s", filename)


def with_lockfile(lock_name):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapped(*args, **kwargs):
            with lockfile_context(lock_name, "scanner") as can_run:
                if can_run:
                    return fn(*args, **kwargs)
                else:
                    return 1

        return wrapped

    return decorator


COMMIT_BATCH_SIZE = 100


def scan_source_folder(session: Session, source: SourceFolder):

    scanner = ImageScanner(source.folder, last_scan_stats=source.stats)

    n = 0
    for n, (path, exif) in enumerate(scanner):
        session.add(Photo.from_path_and_exif(path, exif))

        if n > 0 and n % COMMIT_BATCH_SIZE == 0:
            source.stats = scanner.scan_stats
            session.commit()

    if n % COMMIT_BATCH_SIZE:
        source.stats = scanner.scan_stats
        session.commit()

    click.echo("...found %d new images." % n)


@cli.command()
@click.option("--folder", default=None)
def scan(folder=None):

    engine = create_engine(config.DB_URL, echo=config.SQLA_ECHO)
    session = sessionmaker(engine)()

    query = session.query(SourceFolder)
    if folder is not None:
        query = query.filter_by(folder=folder)

    with lockfile_context("/tmp/photos_scan_run") as existing_lock:
        if existing_lock is not None:
            click.echo("An instance of this command is already running:")
            click.echo("Started by {user} at {created_at}".format(**existing_lock))
            return 1

        for source in query:
            click.echo("Scanning: %s" % source.folder)
            scan_source_folder(session, source)

    return 0


if __name__ == "__main__":

    cli()
