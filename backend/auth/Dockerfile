FROM python:3.12-slim

RUN pip install pip-tools

WORKDIR /usr/src/app

COPY pyproject.toml pyproject.toml
RUN pip-compile --extra dev
RUN pip install -r requirements.txt
COPY . .
RUN pip install --compile --no-cache-dir --no-deps -e '.[dev]'

CMD forum-auth-api
