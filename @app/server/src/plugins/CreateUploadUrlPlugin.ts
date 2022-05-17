import * as AWS from "aws-sdk";
import { gql, makeExtendSchemaPlugin } from "graphile-utils";
import { PoolClient } from "pg";
import { v4 as uuidv4 } from "uuid";

import { OurGraphQLContext } from "../middleware/installPostGraphile";
import { getStripeSubscriptionInfo } from "./StripeSubscriptionInfoPlugin";

const S3_UPLOAD_KEY = process.env.S3_UPLOAD_KEY;
const S3_UPLOAD_SECRET = process.env.S3_UPLOAD_SECRET;
const S3_UPLOAD_BUCKET = process.env.S3_UPLOAD_BUCKET;
const S3_UPLOAD_REGION = process.env.S3_UPLOAD_REGION;

AWS.config.update({
  accessKeyId: S3_UPLOAD_KEY,
  secretAccessKey: S3_UPLOAD_SECRET,
  region: S3_UPLOAD_REGION,
  signatureVersion: "v4",
});

const s3 = new AWS.S3();

interface CreateUploadUrlInput {
  clientMutationId?: string;
  keyPrefix: string;
  contentType: string;
}

/** The minimal set of information that this plugin needs to know about users. */
interface User {
  id: string;
  isVerified: boolean;
  isActive: boolean;
  isFree: boolean;
}

async function getCurrentUser(pool: PoolClient): Promise<User | null> {
  try {
    const {
      rows: [row],
    } = await pool.query(
      "select u.id as user_id, u.is_verified as is_verified, ss.id as subscription_id, u.free_until as free_until from app_public.users u full join app_public.stripe_subscriptions ss on u.id = ss.user_id where u.id = app_public.current_user_id()"
    );
    if (!row) {
      return null;
    }
    let isActive = false;
    if (row.subscription_id) {
      const subscription = await getStripeSubscriptionInfo(row.subscription_id);
      const { status } = subscription ?? {};
      isActive = status == "active";
    }
    const isFree = new Date() < new Date(row.free_until);
    return {
      id: row.user_id,
      isVerified: row.is_verified,
      isActive,
      isFree,
    };
  } catch (err) {
    throw err;
  } finally {
  }
}

/** The set of content types that we allow users to upload.*/
const ALLOWED_UPLOAD_CONTENT_TYPES = [
  "image/apng",
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/tiff",
  "image/webp",
];

const CreateUploadUrlPlugin = makeExtendSchemaPlugin(() => ({
  typeDefs: gql`
    """
    All input for the \`createUploadUrl\` mutation.
    """
    input CreateUploadUrlInput @scope(isMutationInput: true) {
      """
      An arbitrary string value with no semantic meaning. Will be included in the
      payload verbatim. May be used to track mutations by the client.
      """
      clientMutationId: String

      keyPrefix: String
      """
      You must provide the content type (or MIME type) of the content you intend
      to upload. For further information about content types, see
      https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
      """
      contentType: String!
    }

    """
    The output of our \`createUploadUrl\` mutation.
    """
    type CreateUploadUrlPayload @scope(isMutationPayload: true) {
      """
      The exact same \`clientMutationId\` that was provided in the mutation input,
      unchanged and unused. May be used by a client to track mutations.
      """
      clientMutationId: String

      """
      Upload content to this signed URL.
      """
      uploadUrl: String!
      key: String!
      url: String!
    }

    extend type Mutation {
      """
      Get a signed URL for uploading files. It will expire in 5 minutes.
      """
      createUploadUrl(
        """
        The exclusive input argument for this mutation. An object type, make sure to see documentation for this object’s fields.
        """
        input: CreateUploadUrlInput!
      ): CreateUploadUrlPayload
    }
  `,
  resolvers: {
    Mutation: {
      async createUploadUrl(
        _query,
        args: { input: CreateUploadUrlInput },
        context: OurGraphQLContext,
        _resolveInfo
      ) {
        if (!S3_UPLOAD_BUCKET) {
          const err = new Error(
            "Server misconfigured: missing `S3_UPLOADS_BUCKET` envvar"
          );
          // @ts-ignore
          err.code = "MSCFG";
          throw err;
        }

        const user = await getCurrentUser(context.pgClient);

        if (!user) {
          const err = new Error("Login required");
          // @ts-ignore
          err.code = "LOGIN";
          throw err;
        }

        if (!user.isVerified) {
          const err = new Error("Only verified users may upload files");
          // @ts-ignore
          err.code = "DNIED";
          throw err;
        }

        if (!user.isActive && !user.isFree) {
          const err = new Error(
            "Only users with active subscription may upload files"
          );
          // @ts-ignore
          err.code = "DNIED";
          throw err;
        }

        const {
          input: { keyPrefix, contentType, clientMutationId },
        } = args;

        if (!ALLOWED_UPLOAD_CONTENT_TYPES.includes(contentType)) {
          throw new Error(
            `Not allowed to upload that type; allowed types include: '${ALLOWED_UPLOAD_CONTENT_TYPES.join(
              "', '"
            )}'`
          );
        }
        const prefix = keyPrefix ? `${keyPrefix}/` : "";
        const key = `${prefix}${user.id}/${uuidv4()}`;
        const urlPrefix = `https://${S3_UPLOAD_BUCKET}.s3.amazonaws.com`;
        const url = `${urlPrefix}/${key}`;
        const params = {
          Bucket: S3_UPLOAD_BUCKET,
          ContentType: contentType,
          // randomly generated filename, nested under username directory
          Key: key,
          Expires: 60 * 5, // signed URL will expire in 5 minutes
          ACL: "public-read", // uploaded file will be publicly readable
        };
        const signedUrl = await s3.getSignedUrlPromise("putObject", params);
        return {
          clientMutationId,
          uploadUrl: signedUrl,
          key,
          url,
        };
      },
    },
  },
}));

export default CreateUploadUrlPlugin;
