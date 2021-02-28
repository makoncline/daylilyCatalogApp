import {
  ProfileSettingsForm_UserFragment,
  useDeleteUploadMutation,
  useUpdateUserMutation,
} from "@app/graphql";
import { UploadFile } from "antd/lib/upload/interface";
import React, { useState } from "react";

import {
  getFileListFromKeys,
  getKeyFromS3Url,
  getS3UrlFromKey,
  PhotoUpload,
} from "./PhotoUpload";

export const AvatarPhotoUpload = ({
  user,
}: {
  user: ProfileSettingsForm_UserFragment;
}) => {
  const avatarKey = user.avatarUrl ? getKeyFromS3Url(user.avatarUrl) : null;
  const [fileList, setFileList] = useState(
    avatarKey ? getFileListFromKeys([avatarKey]) : []
  );
  const [deleteUpload] = useDeleteUploadMutation();
  const [updateUser] = useUpdateUserMutation();
  const onSuccess = async (file: UploadFile) => {
    await updateUser({
      variables: {
        id: user.id,
        patch: {
          avatarUrl: getS3UrlFromKey(file.uid),
        },
      },
    });
  };

  const onRemove = async (file: UploadFile) => {
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
  return (
    <PhotoUpload
      keyPrefix="avatar"
      onSuccess={onSuccess}
      onRemove={onRemove}
      fileList={fileList}
      setFileList={setFileList}
    />
  );
};
