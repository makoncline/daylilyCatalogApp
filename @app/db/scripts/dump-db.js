const { spawn } = require("child_process");

if (process.env.IN_TESTS === "1") process.exit(0);
const connectionString = process.env.GM_DBURL;
if (!connectionString) {
  console.error("This script requires the Graphile Migrate database context.");
  process.exit(1);
}
const child = spawn(
  "pg_dump",
  [
    "--no-sync",
    "--schema-only",
    "--no-owner",
    "--exclude-schema=graphile_migrate",
    "--exclude-schema=graphile_worker",
    "--file=../../data/schema.sql",
    connectionString,
  ],
  { stdio: "inherit" }
);
child.once("error", (error) => {
  console.error("pg_dump could not start:", error.code);
  process.exitCode = 1;
});
child.once("close", (code) => {
  process.exitCode = code === null ? 1 : code;
});
