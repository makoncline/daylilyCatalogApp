const { spawnSync: baseSpawnSync } = require("child_process");
const { basename, dirname, resolve } = require("path");
const platform = require("os").platform();

function spawnSync(command, args, options = {}) {
  const result = baseSpawnSync(command, args, {
    stdio: "inherit",
    windowsHide: true,
    ...options,
  });
  if (result.status) {
    process.exit(result.status);
  }
  if (result.signal) {
    process.exit(1);
  }
}

// The `docker-compose` project name defaults to the directory name containing
// `docker-compose.yml`, which is the root folder of our project. Let's call
// that 'ROOT'. We're in ROOT/docker/scripts and we want to get the name of
// ROOT:
const projectName = basename(dirname(dirname(resolve(__dirname))));

// On Windows we must run 'yarn.cmd' rather than 'yarn'
const yarnCmd = platform === "win32" ? "yarn.cmd" : "yarn";

spawnSync(yarnCmd, ["down"]);
spawnSync(yarnCmd, ["db:up"]);
spawnSync(yarnCmd, ["compose", "run", "server", "yarn", "setup", projectName]);
