import * as AWS from "aws-sdk";
import { gql, makeExtendSchemaPlugin } from "graphile-utils";

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

interface DeleteUploadInput {
  clientMutationId?: string;
  key: string;
}

const DeleteUploadPlugin = makeExtendSchemaPlugin(() => ({
  typeDefs: gql`
    input DeleteUploadInput @scope(isMutationInput: true) {
      clientMutationId: String
      key: String!
    }

    type DeleteUploadPayload @scope(isMutationPayload: true) {
      clientMutationId: String
      success: Boolean!
    }

    extend type Mutation {
      deleteUpload(input: DeleteUploadInput!): DeleteUploadPayload
    }
  `,
  resolvers: {
    Mutation: {
      async deleteUpload(
        _query,
        args: { input: DeleteUploadInput },
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

        const {
          input: { key, clientMutationId },
        } = args;

        const params = {
          Bucket: S3_UPLOAD_BUCKET,
          Key: key,
        };
        let success = false;
        try {
          await s3.deleteObject(params).promise();
          success = true;
        } catch (err) {
          console.error("ERROR in file Deleting : " + JSON.stringify(err));
        }

        return {
          clientMutationId,
          success,
        };
      },
    },
  },
}));

export default DeleteUploadPlugin;
