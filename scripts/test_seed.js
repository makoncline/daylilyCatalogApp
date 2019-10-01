const fs = require("fs");
const pg = require("pg");
const { promisify } = require("util");
const writeFile = promisify(fs.writeFile);

async function main() {
  const connectionString = process.env.GM_DBURL;
  if (!connectionString) {
    throw new Error("GM_DBURL not set!");
  }
  const pgPool = new pg.Pool({ connectionString });
  try {
    await pgPool.query(
      "drop trigger if exists _200_make_first_user_admin on app_public.users;"
    );
    await pgPool.query("delete from graphile_worker.jobs;");
    await writeFile(
      `${__dirname}/../migrations/__tests__/jest.watch.hack.ts`,
      `export const ts = ${Date.now()};\n`
    );
  } finally {
    await pgPool.end();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
