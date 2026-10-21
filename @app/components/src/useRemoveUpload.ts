import { useDeleteUploadMutation, useSharedQuery } from "@app/graphql";
import { getOwnedUploadKey } from "@app/lib";
import { useCallback } from "react";

export function useRemoveUpload() {
  const [deleteUpload] = useDeleteUploadMutation();
  const userId = useSharedQuery().data?.currentUser?.id;
  return useCallback(
    async (url: string) => {
      if (userId === undefined) throw new Error("Login required");
      const key = getOwnedUploadKey(url, userId, process.env.S3_UPLOAD_BUCKET);
      if (!key) return;
      const { data } = await deleteUpload({ variables: { input: { key } } });
      if (data?.deleteUpload?.success !== true)
        throw new Error("The image could not be deleted");
    },
    [deleteUpload, userId]
  );
}
