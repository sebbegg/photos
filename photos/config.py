import os
import photos

DB_URL = "sqlite:///photosdb.sqlite"
STATIC_FOLDER = os.path.join(os.path.dirname(photos.__file__), "web", "static")

for key in list(locals()):
    if key.isupper():
        env_key = f"PHOTOS_{key}"
        if env_key in os.environ:
            locals()[key] = os.environ[env_key]
