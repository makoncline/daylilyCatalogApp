import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { gql, makeExtendSchemaPlugin } from "graphile-utils";

import { OurGraphQLContext } from "../middleware/installPostGraphile";
import { s3 } from "../utils/s3";
import { createUploadKey, getUploadUser } from "../utils/uploads";

const S3_UPLOAD_BUCKET = process.env.S3_UPLOAD_BUCKET;

interface CreateUploadUrlInput {
  clientMutationId?: string;
  keyPrefix?: string | null;
  contentType: string;
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

        const user = await getUploadUser(context.pgClient);
        if (!user.isVerified) {
          throw Object.assign(
            new Error("Only verified users may upload files"),
            { code: "DNIED" }
          );
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
        const key = createUploadKey(keyPrefix, user.id);
        const urlPrefix = `https://${S3_UPLOAD_BUCKET}.s3.amazonaws.com`;
        const url = `${urlPrefix}/${key}`;
        const signedUrl = await getSignedUrl(
          s3,
          new PutObjectCommand({
            Bucket: S3_UPLOAD_BUCKET,
            ContentType: contentType,
            Key: key,
            ACL: "public-read",
          }),
          { expiresIn: 300, signableHeaders: new Set(["content-type"]) }
        );
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
