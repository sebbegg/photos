from photodb.web.app import create_app
from photodb.model import SourceFolder
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

    app.run(debug=True, host="0.0.0.0", port=5000)
