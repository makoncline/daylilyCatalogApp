# Contributing

We welcome contributions; but please don't expand the scope of the project
without first discussing it with the maintainers (by opening an issue).

## Migrations

This project will only ever have one migration; we do not need to cater to
backwards compatibility, prefering simplicity for new users.

If you wish to change the database, run

```
yarn db uncommit
```

to move the migration back to `current.sql`; then make your changes, and when
you're happy run:

```
yarn db commit
```

and commit your changes.

## Docker and non-Docker

This project is designed to work both with and without Docker. Please don't
break this!

## GraphQL checks

Run yarn lint:graphql to validate the client documents against
data/schema.graphql. The command reads all .graphql files under @app/client/src
together, so fragments can be shared across files. Operations must have names.
Select both nodeId and id where the type has those fields. Inline fragments can
use identifier fields from their parent selection.

The check is part of yarn lint and yarn lint:fix. It does not provide ESLint
editor diagnostics for GraphQL files. Server schema templates are outside this
check. Run yarn test:graphql-lint for its synthetic integration tests.
