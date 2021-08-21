import { Pool } from "pg";

export const queryDb = async (query: string, values: any[]) => {
  const connectionString = process.env.DATABASE_URL;
  const pool: Pool = new Pool({
    connectionString,
  });
  const res = await pool.query(query, values);
  await pool.end();
  return res;
};
