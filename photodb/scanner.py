import base64
import mimetypes
import os
import datetime
import pathlib

import attr
import exifread


def _exifread(path: str) -> dict:
    def _plain_value(v):
        if isinstance(v, exifread.IfdTag):
            if isinstance(v.values, list):
                v = [repr(elem) if isinstance(elem, exifread.utils.Ratio)
                     else elem
                     for elem in v.values]
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

    def __iter__(self):

        if self.last_scan_stats is None:
            self.last_scan_stats = {}
        self.scan_stats = self.last_scan_stats.copy()

        yield from self._scan(self.dirname)

    def _key_for_direntry(self, dirname: str):
        return str(pathlib.Path(dirname).relative_to(self.dirname))

    def _scan(self, dirname):

        relative_dir = self._key_for_direntry(dirname)
        last_scanned = self.last_scan_stats.get(relative_dir, 0)
        self.scan_stats[relative_dir] = datetime.datetime.now().timestamp()

        for entry in os.scandir(dirname):
            stats = entry.stat()
            if stats.st_ctime < last_scanned and stats.st_mtime < last_scanned:
                continue

            if entry.is_file():
                type, enc = mimetypes.guess_type(entry.name)
                if type and type.startswith("image"):
                    yield entry.path, _exifread(entry.path)
            elif entry.is_dir():
                yield from self._scan(entry.path)


if __name__ == "__main__":
    import sys
    import time
    import json

    last_scan = {}
    while True:
        scanner = ImageScanner(sys.argv[1], last_scan_stats=last_scan)

        count = 0
        for count, (path, exif) in enumerate(scanner):
            pass
        print(f"Found {count} images")
        last_scan = scanner.scan_stats

        try:
            time.sleep(1)
        except KeyboardInterrupt:
            break

    print(json.dumps(scanner.scan_stats, indent=4))