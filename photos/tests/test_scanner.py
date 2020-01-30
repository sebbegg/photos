import pathlib

from photos.scanner import ImageScanner

TEST_IMAGES = pathlib.Path(__file__).parent / "some_images"


def test_scanner():
    scanner = ImageScanner(TEST_IMAGES)
    print(scanner)
    for path, tags in scanner:
        pass

    assert len(scanner.scan_stats) == 2


if __name__ == "__main__":

    test_scanner()
