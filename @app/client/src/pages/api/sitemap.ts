import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-control", "stale-while-revalidate, s-maxage=3600");

  const staticUrls = [
    getSitemapEntry("", new Date()),
    getSitemapEntry("/", new Date()),
    getSitemapEntry("/pricing", new Date()),
    getSitemapEntry("/users", new Date()),
    getSitemapEntry("/login", new Date()),
    getSitemapEntry("/register", new Date()),
    getSitemapEntry("/forgot", new Date()),
  ];
  const userIdQueryResult = await queryDb(
    "select id, updated_at from app_public.users",
    []
  );
  const userData = userIdQueryResult.rows;
  const userUrls = userData.map((user) =>
    getSitemapEntry(`/users/${user.id}`, user.updated_at)
  );

  const listingIdQueryResult = await queryDb(
    "select id, updated_at from app_public.lilies",
    []
  );
  const listingData = listingIdQueryResult.rows;
  const listingUrls = listingData.map((listing) =>
    getSitemapEntry(`/catalog/${listing.id}`, listing.updated_at)
  );

  const xml = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticUrls.join("\n")}
    ${userUrls.join("\n")}
    ${listingUrls.join("\n")}
    </urlset>
  `;

  res.end(xml);
}

const getSitemapEntry = (path: string, lastmod: Date) => {
  return `
    <url>
      <loc>${process.env.ROOT_URL}${path}</loc>
      <lastmod>${lastmod.toISOString().split("T")[0]}</lastmod>
    </url>
  `;
};

export const queryDb = async (query: string, values: any[]) => {
  const connectionString = process.env.DATABASE_URL;
  const pool: Pool = new Pool({
    connectionString,
  });
  const res = await pool.query(query, values);
  await pool.end();
  return res;
};
