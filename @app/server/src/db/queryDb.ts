import { Pool } from "pg";

export const queryDb = async (query: string) => {
  const pool: Pool = new Pool({
    user: process.env.DATABASE_SUPERUSER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_SUPERUSER_PASSWORD,
  });
  const res = await pool.query(query);
  await pool.end();
  return res;
};
