export const UPLOAD_KINDS = ["lily", "avatar", "profile"] as const;
export type UploadKind = typeof UPLOAD_KINDS[number];

export function parseUploadKey(key: string) {
  const match =
    /^(lily|avatar|profile)\/([1-9][0-9]{0,9})\/([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/.exec(
      key
    );
  return match
    ? { kind: match[1] as UploadKind, ownerId: match[2], key }
    : null;
}

export function getOwnedUploadKey(
  url: string,
  userId: number | undefined,
  bucket: string | undefined
): string | null {
  if (!bucket || userId === undefined) return null;
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      parsed.hostname !== `${bucket}.s3.amazonaws.com` ||
      parsed.port ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash
    )
      return null;
    const upload = parseUploadKey(parsed.pathname.slice(1));
    return upload?.ownerId === String(userId) ? upload.key : null;
  } catch {
    return null;
  }
}
