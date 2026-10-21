FROM node:24.22.1-bookworm

ARG USER_UID=1000
ARG SETUP_MODE=normal

COPY docker/install-postgresql-client.sh /install-postgresql-client.sh
COPY docker/setup.sh /setup.sh
RUN sh /setup.sh "$SETUP_MODE"
USER node
