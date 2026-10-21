import { S3Client } from "@aws-sdk/client-s3";

const accessKeyId = process.env.S3_UPLOAD_KEY;
const secretAccessKey = process.env.S3_UPLOAD_SECRET;
if (Boolean(accessKeyId) !== Boolean(secretAccessKey)) {
  throw new Error("S3_UPLOAD_KEY and S3_UPLOAD_SECRET must be set together");
}
export const s3 = new S3Client({
  region: process.env.S3_UPLOAD_REGION,
  credentials:
    accessKeyId && secretAccessKey
      ? { accessKeyId, secretAccessKey }
      : undefined,
  requestChecksumCalculation: "WHEN_REQUIRED",
});
