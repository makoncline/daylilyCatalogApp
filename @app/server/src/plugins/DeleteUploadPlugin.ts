import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { gql, makeExtendSchemaPlugin } from "graphile-utils";

import { OurGraphQLContext } from "../middleware/installPostGraphile";
import { s3 } from "../utils/s3";
import { authorizeUploadKey, getUploadUser } from "../utils/uploads";

const S3_UPLOAD_BUCKET = process.env.S3_UPLOAD_BUCKET;

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
        context: OurGraphQLContext
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

        const user = await getUploadUser(context.pgClient);
        authorizeUploadKey(key, user.id);
        try {
          await s3.send(
            new DeleteObjectCommand({ Bucket: S3_UPLOAD_BUCKET, Key: key })
          );
        } catch {
          throw Object.assign(new Error("The image could not be deleted"), {
            code: "UPLDE",
          });
        }
        return {
          clientMutationId,
          success: true,
        };
      },
    },
  },
}));

export default DeleteUploadPlugin;
