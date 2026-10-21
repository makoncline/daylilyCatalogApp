import { parseUploadKey, UPLOAD_KINDS } from "@app/lib";
import { randomUUID } from "node:crypto";
import { PoolClient } from "pg";

export async function getUploadUser(pgClient: PoolClient) {
  const { rows } = await pgClient.query<{ id: number; isVerified: boolean }>(
    'select id, is_verified as "isVerified" from app_public.users where id = app_public.current_user_id()'
  );
  if (!rows[0])
    throw Object.assign(new Error("Login required"), { code: "LOGIN" });
  return rows[0];
}

export function createUploadKey(
  kind: string | null | undefined,
  userId: number
) {
  if (!UPLOAD_KINDS.some((allowed) => allowed === kind)) {
    throw Object.assign(new Error("Invalid upload kind"), { code: "BADUP" });
  }
  return `${kind}/${userId}/${randomUUID()}`;
}

export function authorizeUploadKey(key: string, userId: number) {
  const upload = parseUploadKey(key);
  if (!upload || upload.ownerId !== String(userId)) {
    throw Object.assign(new Error("You cannot delete this upload"), {
      code: "DNIED",
    });
  }
  return upload.key;
}
