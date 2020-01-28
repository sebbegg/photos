from flask import Blueprint, send_from_directory, current_app

react_blueprint = Blueprint("react", __name__)


@react_blueprint.route("/", defaults={"path": ""})
@react_blueprint.route("/<path:path>")
def catch_all(path):
    print("catch all for: " + path)
    return send_from_directory(current_app.static_folder, "index.html")
