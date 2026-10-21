# Local development containers

Use Node24.22.1 and Yarn1.22.22. Docker and the Compose plugin run on the host.
On macOS or Linux, run `export UID` before `yarn docker setup`.

The development image includes PostgreSQL client18. Schema dumps run as the
application user and write to `data/schema.sql`. Containers have no Docker
socket access, Docker client or passwordless sudo.

The Compose helper uses the lowercase checkout name as its explicit project
name. It does not use a generated `COMPOSE_PROJECT_NAME`.

The database service uses PostgreSQL18 and a new `db-pg18` volume at
`/var/lib/postgresql`. The old PostgreSQL12 volume is left intact. Do not attach
it to PostgreSQL18 or delete it. If it contains required data, verify a logical
backup and restore into the new database before using that data.

`yarn docker setup` resets its configured application databases.
`yarn docker reset` removes this Compose project's current volumes. Use these
commands only for disposable development data.

Production deployment is a separate operation. This change does not verify the
remote deployment workflow or its Compose installation.
