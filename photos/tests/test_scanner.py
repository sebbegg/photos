import pathlib
from photos.scanner import ImageScanner
from photos.model import Photo

TEST_IMAGES = pathlib.Path(__file__).parent / "some_images"


def test_scanner():
    scanner = ImageScanner(TEST_IMAGES)
    print(scanner)
    for path, tags in scanner:
        print(Photo.from_path_and_exif(path, tags))

    print(scanner.dirs_modified_times)


if __name__ == "__main__":

    test_scanner()
