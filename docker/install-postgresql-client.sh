#!/bin/sh
set -eu
export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y --no-install-recommends ca-certificates curl
install -d -m 0755 /usr/share/postgresql-common/pgdg
key=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
curl --fail --silent --show-error --location \
  https://www.postgresql.org/media/keys/ACCC4CF8.asc --output "$key"
printf '%s  %s\n' \
  '0144068502a1eddd2a0280ede10ef607d1ec592ce819940991203941564e8e76' \
  "$key" | sha256sum --check
chmod 0644 "$key"

. /etc/os-release
cat > /etc/apt/sources.list.d/pgdg.sources <<EOF
Types: deb
URIs: https://apt.postgresql.org/pub/repos/apt
Suites: ${VERSION_CODENAME}-pgdg
Architectures: $(dpkg --print-architecture)
Components: main
Signed-By: $key
EOF

apt-get update
apt-get install -y --no-install-recommends postgresql-client-18
