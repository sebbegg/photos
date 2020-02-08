import pathlib

from photos.scanner import scan_source_folder, folder_to_album_name
from photos.model import SourceFolder, Album

TEST_IMAGES = pathlib.Path(__file__).parent / "some_images"


def test_scanner(db_session):

    src = SourceFolder(folder=str(TEST_IMAGES))
    scan_source_folder(session=db_session, source=src)

    assert db_session.query(Album).filter_by(name=folder_to_album_name("folder")).one() is not None
    assert len(db_session.query(Album).all()) == 1


if __name__ == "__main__":

    test_scanner()
