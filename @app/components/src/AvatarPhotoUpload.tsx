import {
  ProfileSettingsForm_UserFragment,
  useDeleteUploadMutation,
  useUpdateUserMutation,
} from "@app/graphql";
import s3Uri from "amazon-s3-uri";
import { UploadFile } from "antd/lib/upload/interface";
import React from "react";

import { bucketUrl, PhotoUpload } from "./PhotoUpload";

export const AvatarPhotoUpload = ({
  user,
}: {
  user: ProfileSettingsForm_UserFragment;
}) => {
  const [deleteUpload] = useDeleteUploadMutation();
  const [updateUser] = useUpdateUserMutation();
  const onSuccess = async (file: UploadFile) => {
    console.log("success: ", file);
    await updateUser({
      variables: {
        id: user.id,
        patch: {
          avatarUrl: `${bucketUrl}/${file.uid}`,
        },
      },
    });
  };
  const onRemove = async (file: UploadFile) => {
    console.log("remove: ", file);
    await deleteUpload({
      variables: {
        input: {
          key: file.uid,
        },
      },
    });
    await updateUser({
      variables: {
        id: user.id,
        patch: {
          avatarUrl: null,
        },
      },
    });
  };
  let keys: string[] = [];
  if (user.avatarUrl) {
    const { key } = s3Uri(user.avatarUrl);
    keys = [key];
  }
  return (
    <PhotoUpload
      keys={keys}
      keyPrefix="ava"
      onSuccess={onSuccess}
      onRemove={onRemove}
    />
  );
};
