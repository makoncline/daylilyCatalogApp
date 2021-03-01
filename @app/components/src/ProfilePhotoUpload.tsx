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
  PhotoUpload,
} from "./PhotoUpload";

export const ProfilePhotoUpload = ({
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
  const [localUser, setLocalUser] = useState(user);

  const [deleteUpload] = useDeleteUploadMutation();

  const onSuccess = async (file: UploadFile) => {
    const imgUrls = localUser.imgUrls ? localUser.imgUrls : [];
    const newImgUrls = file.url ? imgUrls.concat(file.url) : imgUrls;
    await updateUser({
      variables: {
        id: user.id,
        patch: {
          imgUrls,
        },
      },
    });
    const { data } = await updateUser({
      variables: {
        id: localUser.id,
        patch: {
          imgUrls: newImgUrls,
        },
      },
    });
    const newUser = data?.updateUser?.user;
    if (newUser) {
      setLocalUser(newUser);
      console.log("updated user photos: ", newUser);
    }
  };

  const onRemove = async (file: UploadFile) => {
    await deleteUpload({
      variables: {
        input: {
          key: file.uid,
        },
      },
    });
    const imgUrls = localUser.imgUrls ? localUser.imgUrls : [];
    const imgUrlToRemove = file.url;
    const newImgUrls = imgUrls.filter((url) => url !== imgUrlToRemove);
    const { data } = await updateUser({
      variables: {
        id: localUser.id,
        patch: {
          imgUrls: newImgUrls,
        },
      },
    });
    const newUser = data?.updateUser?.user;
    if (newUser) {
      setLocalUser(newUser);
      console.log("deleted user photos: ", newUser);
    }
  };
  return (
    <PhotoUpload
      maxCount={4}
      keyPrefix="profile"
      onSuccess={onSuccess}
      onRemove={onRemove}
      fileList={fileList}
      setFileList={setFileList}
    />
  );
};
