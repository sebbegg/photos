import base64
import mimetypes
import os
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
    skip_dirs_modified_before = attr.ib(factory=dict)
    dirs_modified_times = attr.ib(factory=dict)

    def _key_for_direntry(self, entry: os.DirEntry):
        return str(pathlib.Path(entry.path).relative_to(self.dirname))

    def _skip_dir(self, entry: os.DirEntry):

        key = self._key_for_direntry(entry)
        stats = entry.stat()
        self.dirs_modified_times[key] = stats.st_mtime

        return stats.st_mtime <= self.skip_dirs_modified_before.get(key, 0)

    def __iter__(self):

        self.dirs_modified_times = {}
        yield from self._scan(self.dirname)

    def _scan(self, dirname):

        for entry in os.scandir(dirname):
            if entry.is_file():
                type, enc = mimetypes.guess_type(entry.name)
                if type and type.startswith("image"):
                    yield entry.path, _exifread(entry.path)
            elif entry.is_dir() and not self._skip_dir(entry):
                yield from self._scan(entry.path)
