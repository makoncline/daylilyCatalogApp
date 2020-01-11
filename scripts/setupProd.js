const dotenv = require("dotenv");
const inquirer = require("inquirer");
const pg = require("pg");

async function main() {
  dotenv.config({ path: `${__dirname}/../production.env` });
  const {
    DATABASE_SUPERUSER,
    DATABASE_SUPERUSER_PASSWORD,
    DATABASE_AUTHENTICATOR,
    DATABASE_AUTHENTICATOR_PASSWORD,
    DATABASE_NAME,
    DATABASE_OWNER,
    DATABASE_OWNER_PASSWORD,
    DATABASE_VISITOR,
    DATABASE_HOST,
    CONFIRM_DROP,
  } = process.env;
  const SUPERUSER_TEMPLATE1_URL = `postgres://${DATABASE_SUPERUSER}:${DATABASE_SUPERUSER_PASSWORD}@${DATABASE_HOST}/template1`;
  const SUPERUSER_DATABASE_URL = `postgres://${DATABASE_SUPERUSER}:${DATABASE_SUPERUSER_PASSWORD}@${DATABASE_HOST}/${DATABASE_NAME}`;

  let dropComfirmed = false;
  if (!CONFIRM_DROP) {
    const confirm = await inquirer.prompt([
      {
        type: "confirm",
        name: "CONFIRM",
        default: false,
        message: `Do you want to drop (if necessary):

  - database ${DATABASE_NAME}
  - database ${DATABASE_NAME}_shadow
  - database role ${DATABASE_VISITOR} (cascade)
  - database role ${DATABASE_AUTHENTICATOR} (cascade)
  - database role ${DATABASE_OWNER}`,
      },
    ]);
    if (!confirm.CONFIRM) {
      // console.error("Confirmation failed; exiting");
      // process.exit(1);
    } else {
      dropComfirmed = true;
    }
  }
  if (dropComfirmed) {
    console.log("Installing  or reinstalling the roles and database...");
  } else {
    console.log("Installing the roles and database...");
  }
  console.log("Installing the roles and database...");
  const pgPool = new pg.Pool({
    connectionString: SUPERUSER_TEMPLATE1_URL,
  });

  pgPool.on("error", err => {
    // Ignore
    console.log(
      "An error occurred whilst trying to talk to the database: " + err.message
    );
  });

  // Wait for PostgreSQL to come up
  let attempts = 0;
  while (true) {
    try {
      await pgPool.query('select true as "Connection test";');
      break;
    } catch (e) {
      attempts++;
      if (attempts <= 30) {
        console.log(`Database is not ready yet (attempt ${attempts})`);
      } else {
        console.log(`Database never came up, aborting :(`);
        process.exit(1);
      }
      await sleep(1000);
    }
  }

  const client = await pgPool.connect();
  try {
    if (dropComfirmed) {
      //RESET database
      await client.query(`DROP DATABASE IF EXISTS ${DATABASE_NAME};`);
      await client.query(`DROP DATABASE IF EXISTS ${DATABASE_NAME}_shadow;`);
      await client.query(`DROP DATABASE IF EXISTS ${DATABASE_NAME}_test;`);
      await client.query(`DROP ROLE IF EXISTS ${DATABASE_VISITOR};`);
      await client.query(`DROP ROLE IF EXISTS ${DATABASE_AUTHENTICATOR};`);
      await client.query(`DROP ROLE IF EXISTS ${DATABASE_OWNER};`);
      console.log("database reset successful");
    }
    // Now to set up the production database:
    await client.query(
      `CREATE ROLE ${DATABASE_OWNER} WITH LOGIN PASSWORD '${DATABASE_OWNER_PASSWORD}';`
    );
    await client.query(`GRANT ${DATABASE_OWNER} TO ${DATABASE_SUPERUSER};`);

    // This is the no-access role that PostGraphile will run as by default`);
    await client.query(
      `CREATE ROLE ${DATABASE_AUTHENTICATOR} WITH LOGIN PASSWORD '${DATABASE_AUTHENTICATOR_PASSWORD}' NOINHERIT;`
    );

    // This is the role that PostGraphile will switch to (from ${DATABASE_AUTHENTICATOR}) during a GraphQL request
    await client.query(`CREATE ROLE ${DATABASE_VISITOR};`);

    // This enables PostGraphile to switch from ${DATABASE_AUTHENTICATOR} to ${DATABASE_VISITOR}
    await client.query(
      `GRANT ${DATABASE_VISITOR} TO ${DATABASE_AUTHENTICATOR};`
    );

    // Create database
    await client.query(
      `CREATE DATABASE ${DATABASE_NAME} OWNER ${DATABASE_OWNER};`
    );
    // Database permissions
    await client.query(`REVOKE ALL ON DATABASE ${DATABASE_NAME} FROM PUBLIC;`);
    await client.query(
      `GRANT ALL ON DATABASE ${DATABASE_NAME} TO ${DATABASE_OWNER};`
    );
    await client.query(
      `GRANT CONNECT ON DATABASE ${DATABASE_NAME} TO ${DATABASE_AUTHENTICATOR};`
    );
    console.log("database setup successful");
  } finally {
    await client.release();
  }
  await pgPool.end();

  const clientSuper = new pg.Client({
    connectionString: SUPERUSER_DATABASE_URL,
  });
  await clientSuper.connect();
  try {
    await clientSuper.query(`GRANT rds_superuser TO ${DATABASE_SUPERUSER};`);
    await clientSuper.query(
      `CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;`
    );
    await clientSuper.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;`
    );
    await clientSuper.query(
      `CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;`
    );
    await clientSuper.query(
      `CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;`
    );
    console.log("database extension install successful");
  } finally {
    await clientSuper.end();
  }

  console.log();
  console.log();
  console.log("____________________________________________________________");
  console.log();
  console.log();
  console.log("✅ Setup success");
  console.log();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
