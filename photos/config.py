import os
import photos

DB_URL = "sqlite:///photosdb.sqlite"
STATIC_FOLDER = os.path.join(os.path.dirname(photos.__file__), "web", "static")
LOGLEVEL = "INFO"
SQLA_ECHO = True

for key in list(locals()):
    if key.isupper():
        env_key = f"PHOTOS_{key}"
        default = locals()[key]

        if env_key in os.environ:
            value = os.environ[env_key]
            if isinstance(default, bool):
                value = value.lower() in ("t", "true", "1", "y", "yes")
            locals()[key] = value
