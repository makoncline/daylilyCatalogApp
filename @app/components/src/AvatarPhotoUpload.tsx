import {
  ProfileSettingsForm_UserFragment,
  useDeleteUploadMutation,
  useUpdateUserMutation,
} from "@app/graphql";
import { UploadFile } from "antd/lib/upload/interface";
import React, { useState } from "react";

import {
  getFileListFromUrls,
  getS3UrlFromKey,
  PhotoUpload,
} from "./PhotoUpload";

export const AvatarPhotoUpload = ({
  user,
}: {
  user: ProfileSettingsForm_UserFragment;
}) => {
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [fileList, setFileList] = useState(
    avatarUrl ? getFileListFromUrls([avatarUrl]) : []
  );
  const [deleteUpload] = useDeleteUploadMutation();
  const [updateUser] = useUpdateUserMutation();
  const onSuccess = async (file: UploadFile) => {
    const newAvatarUrl = getS3UrlFromKey(file.uid);
    await updateUser({
      variables: {
        id: user.id,
        patch: {
          avatarUrl: newAvatarUrl,
        },
      },
    });
    setAvatarUrl(newAvatarUrl);
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
    setAvatarUrl(null);
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
