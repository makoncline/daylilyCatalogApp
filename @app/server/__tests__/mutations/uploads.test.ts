import { getOwnedUploadKey } from "@app/lib";
import { graphql, GraphQLSchema } from "graphql";
import { Pool } from "pg";
import {
  createPostGraphileSchema,
  withPostGraphileContext,
} from "postgraphile";

import { getPostGraphileOptions } from "../../src/middleware/installPostGraphile";
import { s3 } from "../../src/utils/s3";

const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
const options = getPostGraphileOptions({ rootPgPool: pool });
let schema: GraphQLSchema;
let requests: { method: string; path: string }[] = [];
let failDelete = false;
let owner: { id: number; session: string };
let other: { id: number; session: string };
const uuid = "67cac85c-2e81-4eb5-8859-1f7475d2b76f";

beforeAll(async () => {
  s3.config.requestHandler = {
    async handle(request) {
      requests.push({ method: request.method, path: request.path });
      return {
        response: {
          statusCode: failDelete ? 403 : 204,
          headers: {},
          body: Buffer.from(""),
        },
      };
    },
  };
  schema = await createPostGraphileSchema(pool, "app_public", options);
});

beforeEach(async () => {
  requests = [];
  failDelete = false;
  await pool.query(
    "delete from app_public.users where username like 'security_upload_%'"
  );
  const users = [];
  for (const suffix of ["owner", "other"]) {
    const {
      rows: [user],
    } = await pool.query(
      "select * from app_private.really_create_user(username := $1, email := $2, email_is_verified := false, name := null, avatar_url := null, password := $3)",
      [
        "security_upload_" + suffix,
        suffix + "@example.invalid",
        "fixture-password",
      ]
    );
    const {
      rows: [session],
    } = await pool.query(
      "insert into app_private.sessions(user_id) values($1) returning uuid",
      [user.id]
    );
    users.push({ id: user.id, session: session.uuid });
  }
  [owner, other] = users;
});

afterEach(async () => {
  await pool.query(
    "delete from app_public.users where username like 'security_upload_%'"
  );
});

afterAll(async () => {
  s3.destroy();
  await pool.end();
});

function remove(key: string, session?: string) {
  return withPostGraphileContext(
    {
      ...options,
      pgPool: pool,
      pgSettings: {
        role: process.env.DATABASE_VISITOR,
        "jwt.claims.session_id": session || "",
      },
    },
    (context) =>
      graphql(
        schema,
        "mutation Remove($key: String!) { deleteUpload(input: {key: $key}) { success } }",
        null,
        context,
        { key }
      )
  );
}

test("anonymous and foreign namespaces cannot reach S3", async () => {
  const owned = `lily/${owner.id}/${uuid}`;
  expect((await remove(owned)).errors).toBeTruthy();
  for (const key of [
    owned,
    `avatar/${owner.id}/${uuid}`,
    `profile/${owner.id}/${uuid}`,
    `lily/0${other.id}/${uuid}`,
    `lily/${other.id}/../${uuid}`,
    `lily/%32/${uuid}`,
    "arbitrary-key",
  ]) {
    expect((await remove(key, other.session)).errors).toBeTruthy();
  }
  expect(requests).toHaveLength(0);
});

test("an unverified owner can delete each exact minted namespace", async () => {
  for (const kind of ["lily", "avatar", "profile"]) {
    const key = `${kind}/${owner.id}/${uuid}`;
    const result = await remove(key, owner.session);
    expect(result.errors).toBeUndefined();
    expect(result.data?.deleteUpload.success).toBe(true);
    expect(requests[requests.length - 1]).toEqual({
      method: "DELETE",
      path: "/" + key,
    });
  }
  expect(requests).toHaveLength(3);
});

test("S3 failure is returned to the caller and foreign URL references do not grant deletion", async () => {
  const key = `lily/${owner.id}/${uuid}`;
  const url = `https://${process.env.S3_UPLOAD_BUCKET}.s3.amazonaws.com/${key}`;
  expect(getOwnedUploadKey(url, owner.id, process.env.S3_UPLOAD_BUCKET)).toBe(
    key
  );
  expect(
    getOwnedUploadKey(url, other.id, process.env.S3_UPLOAD_BUCKET)
  ).toBeNull();
  for (const value of [
    url + "?copy=1",
    url.replace("https:", "http:"),
    url.replace(".s3.amazonaws.com", ".s3.amazonaws.com.evil.invalid"),
    "https://images.example.invalid/photo.png",
  ]) {
    expect(
      getOwnedUploadKey(value, owner.id, process.env.S3_UPLOAD_BUCKET)
    ).toBeNull();
  }
  failDelete = true;
  const result = await remove(key, owner.session);
  expect(result.errors).toBeTruthy();
  expect(result.data?.deleteUpload).toBeNull();
  expect(requests).toHaveLength(1);
});

test("only verified users can mint short-lived URLs in their own upload namespace", async () => {
  async function create(
    keyPrefix: string,
    contentType: string,
    session?: string
  ) {
    return withPostGraphileContext(
      {
        ...options,
        pgPool: pool,
        pgSettings: {
          role: process.env.DATABASE_VISITOR,
          "jwt.claims.session_id": session || "",
        },
      },
      (context) =>
        graphql(
          schema,
          "mutation Create($kind: String!, $type: String!) { createUploadUrl(input: {keyPrefix: $kind, contentType: $type}) { key url uploadUrl } }",
          null,
          context,
          { kind: keyPrefix, type: contentType }
        )
    );
  }

  expect((await create("lily", "image/png")).errors).toBeTruthy();
  expect(
    (await create("lily", "image/png", owner.session)).errors
  ).toBeTruthy();
  await pool.query(
    "update app_public.users set is_verified = true where id = $1",
    [owner.id]
  );
  for (const [kind, type] of [
    ["../avatar", "image/png"],
    ["lily", "text/html"],
  ]) {
    expect((await create(kind, type, owner.session)).errors).toBeTruthy();
  }
  for (const kind of ["lily", "avatar", "profile"]) {
    const result = await create(kind, "image/png", owner.session);
    expect(result.errors).toBeUndefined();
    const upload = result.data?.createUploadUrl;
    expect(upload.key).toMatch(
      new RegExp("^" + kind + "/" + owner.id + "/[0-9a-f-]{36}$")
    );
    const url = new URL(upload.uploadUrl);
    expect(url.protocol).toBe("https:");
    expect(url.pathname).toBe("/" + upload.key);
    expect(url.searchParams.get("X-Amz-Expires")).toBe("300");
    expect(url.searchParams.get("X-Amz-SignedHeaders")).toContain(
      "content-type"
    );
    expect(upload.url).toBe(
      "https://" +
        process.env.S3_UPLOAD_BUCKET +
        ".s3.amazonaws.com/" +
        upload.key
    );
  }
  expect(requests).toHaveLength(0);
});
