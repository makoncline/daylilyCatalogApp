const { runSync } = require("../../scripts/lib/run");
const platform = require("os").platform();
const { safeRandomString } = require("../../scripts/lib/random");
const fs = require("fs");
const fsp = fs.promises;

const DOCKER_DOTENV_PATH = `${__dirname}/../.env`;

if (platform !== "win32" && !process.env.UID) {
  console.error(
    "You should run `export UID` before running 'yarn docker setup' otherwise you may end up with permissions issues."
  );
  process.exit(1);
}

async function main() {
  // Check that docker/.env exists
  try {
    await fsp.access(DOCKER_DOTENV_PATH, fs.constants.F_OK);
  } catch {
    // Does not exist, write it
    const password = safeRandomString(30);
    const data = `
# We'd like scripts ran through Docker to pretend they're in a normal
# interactive terminal.
FORCE_COLOR=2

# Setup resets only this development environment's databases.
CONFIRM_DROP=y

# POSTGRES_PASSWORD is the superuser password for PostgreSQL, it's required to
# initialize the Postgres docker volume.
POSTGRES_PASSWORD=${password}

# We're accessing Postgres via Docker, so we must use the db host and the
# relevant password.
DATABASE_HOST=db
ROOT_DATABASE_URL=postgres://postgres:${password}@db/postgres
`;
    await fsp.writeFile(DOCKER_DOTENV_PATH, data, { mode: 0o600 });
  }

  // On Windows we must run 'yarn.cmd' rather than 'yarn'
  const yarnCmd = platform === "win32" ? "yarn.cmd" : "yarn";

  runSync(yarnCmd, ["down"]);
  runSync(yarnCmd, ["db:up"]);

  runSync(yarnCmd, [
    "compose",
    "run",
    "--rm",
    "--no-deps",
    "--user",
    "root",
    "server",
    "chown",
    "-R",
    "node:node",
    "/work/node_modules",
    "/work/@app/client/node_modules",
    "/work/@app/config/node_modules",
    "/work/@app/db/node_modules",
    "/work/@app/e2e/node_modules",
    "/work/@app/graphql/node_modules",
    "/work/@app/server/node_modules",
    "/work/@app/worker/node_modules",
  ]);
  runSync(yarnCmd, ["compose", "run", "--rm", "server", "yarn", "setup"]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
