import contextlib
import datetime
import functools
import json
import logging
import os

import click
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import photos.config as config
from photos.model import SourceFolder
from photos.scanner import scan_source_folder

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


def _do_scan(folder):

    engine = create_engine(config.DB_URL, echo=config.SQLA_ECHO)
    session = sessionmaker(engine)()

    query = session.query(SourceFolder)
    if folder is not None:
        query = query.filter_by(folder=folder)

    source_folders = query.all()
    for source in source_folders:
        click.echo("Scanning: %s" % source.folder)
        scan_source_folder(session, source)

    if not source_folders:
        click.echo("No source folders configured")


@cli.command()
@click.option("--folder", default=None)
def scan(folder=None):

    import time

    time.sleep(5)
    with lockfile_context("/tmp/photos_scan_run") as existing_lock:
        if existing_lock is not None:
            click.echo("An instance of this command is already running:")
            click.echo("Started by {user} at {created_at}".format(**existing_lock))
            return 1

        _do_scan(folder)

    return 0


if __name__ == "__main__":

    cli()
