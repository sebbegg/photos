FROM python:3.7-slim

COPY Pipfile* /app/
COPY photos /app/photos
COPY photos-ui/build /app/photos/web/static

WORKDIR /app
RUN pip install gunicorn[gevent] pipenv &&\
    pipenv install --system &&\
    cp -rv /app/photos/web/static/static/* /app/photos/web/static/ &&\
    ls -lrth /app/photos/web/static

ENV GUNICORN_CMD_ARGS "--bind=0.0.0.0:80 --worker-class=gevent --workers=1"

CMD ["gunicorn", "photos.wsgi:app"]
