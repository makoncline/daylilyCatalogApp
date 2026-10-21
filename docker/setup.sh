#!/bin/sh
set -eu
export DEBIAN_FRONTEND=noninteractive

sh /install-postgresql-client.sh
apt-get install -y --no-install-recommends \
  dialog git bash-completion iproute2 procps

if [ "$1" = "dev" ]; then
  apt-get install -y --no-install-recommends neovim tmux locales dos2unix
fi

case "$USER_UID" in
  ''|*[!0-9]*) echo "USER_UID must be a positive integer" >&2; exit 1 ;;
esac
if [ "$USER_UID" -eq 0 ]; then
  echo "Development must use a non-root UID" >&2
  exit 1
fi
if [ "$USER_UID" != "1000" ]; then
  usermod --uid "$USER_UID" node
fi
install -d -o node -g node /dist /app
apt-get clean
rm -rf /var/lib/apt/lists/*
rm /setup.sh /install-postgresql-client.sh
