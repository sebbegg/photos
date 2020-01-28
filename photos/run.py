from photos.web.app import create_app
from photos.model import SourceFolder
import sqlalchemy.exc as sa_exc

if __name__ == "__main__":
    app = create_app()

    session = app.sessionfactory()
    session.add(SourceFolder(folder="/Users/sebastianeckweiler/PycharmProjects/photodb/data"))
    try:
        session.commit()
    except sa_exc.IntegrityError:
        session.rollback()
        pass
    finally:
        session.close()

    print("Serving static from: " + app.static_folder)
    app.run(debug=True, host="0.0.0.0", port=5000)
