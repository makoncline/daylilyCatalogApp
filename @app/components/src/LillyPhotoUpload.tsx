import {
  ProfileSettingsForm_UserFragment,
  useDeleteUploadMutation,
  useUpdateUserMutation,
} from "@app/graphql";
import { UploadFile } from "antd/lib/upload/interface";
import React, { useEffect, useState } from "react";

import {
  getFileListFromKeys,
  getKeyFromS3Url,
  PhotoUpload,
} from "./PhotoUpload";

export const LilyPhotoUpload = ({
  user,
}: {
  user: ProfileSettingsForm_UserFragment;
}) => {
  const profilePhotoUrls = user.imgUrls ? (user.imgUrls as Array<string>) : [];
  const profilePhotoKeys = profilePhotoUrls.map(getKeyFromS3Url);
  const [fileList, setFileList] = useState(
    profilePhotoKeys ? getFileListFromKeys(profilePhotoKeys) : []
  );
  const [updateUser] = useUpdateUserMutation();
  useEffect(() => {
    const imgUrls = fileList
      .filter((file) => file.status === "done")
      .filter((file) => file.url)
      .map((file) => file.url) as string[];
    if (imgUrls !== user.imgUrls) {
      (async function () {
        await updateUser({
          variables: {
            id: user.id,
            patch: {
              imgUrls,
            },
          },
        });
      })();
    }
  }, [fileList, updateUser, user.id, user.imgUrls]);

  const [deleteUpload] = useDeleteUploadMutation();
  const onSuccess = async (file: UploadFile) => {
    console.log("file:", file);
  };

  const onRemove = async (file: UploadFile) => {
    await deleteUpload({
      variables: {
        input: {
          key: file.uid,
        },
      },
    });
  };
  return (
    <PhotoUpload
      maxCount={4}
      keyPrefix="lily"
      onSuccess={onSuccess}
      onRemove={onRemove}
      fileList={fileList}
      setFileList={setFileList}
    />
  );
};
