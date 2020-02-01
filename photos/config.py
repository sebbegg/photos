import os

PHOTOS_DB_URL = os.getenv("PHOTOS_DB_URL", "sqlite:///photosdb.sqlite")
