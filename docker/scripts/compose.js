const { basename, resolve } = require("path");
const { runSync } = require("../../scripts/lib/run");

const root = resolve(__dirname, "../..");
const projectName = basename(root)
  .toLowerCase()
  .replace(/[^a-z0-9_-]/g, "")
  .replace(/^[^a-z0-9]+/, "");
if (!projectName)
  throw new Error("The checkout needs a valid Compose project name");

runSync(
  "docker",
  [
    "compose",
    "--project-name",
    projectName,
    "--file",
    resolve(root, "docker-compose.yml"),
    ...process.argv.slice(2),
  ],
  { cwd: root }
);
