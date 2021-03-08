import {
  LilyDataFragment,
  useDeleteUploadMutation,
  useEditLilyMutation,
} from "@app/graphql";
import { UploadFile } from "antd/lib/upload/interface";
import React, { useState } from "react";

import { PhotoUpload } from "./PhotoUpload";

export const LilyPhotoUpload = ({
  lily,
  fileList,
  setFileList,
}: {
  lily: LilyDataFragment;
  fileList: UploadFile<any>[];
  setFileList: (fileList: UploadFile<any>[]) => void;
}) => {
  const [deleteUpload] = useDeleteUploadMutation();
  const [editLily] = useEditLilyMutation();
  const [localLily, setLocalLily] = useState(lily);

  const onSuccess = async (file: UploadFile) => {
    const imgUrls = localLily.imgUrl ? localLily.imgUrl : [];
    const newImgUrls = file.url ? imgUrls.concat(file.url) : imgUrls;
    try {
      const { data } = await editLily({
        variables: {
          id: localLily.id,
          imgUrl: newImgUrls,
        },
      });
      const newLily = data?.updateLily?.lily;
      if (newLily) {
        setLocalLily(newLily);
      }
    } catch (err) {
      throw err;
    }
  };

  const onRemove = async (file: UploadFile) => {
    try {
      await deleteUpload({
        variables: {
          input: {
            key: file.uid,
          },
        },
      });
    } catch (err) {
      throw err;
    }
    const imgUrls = localLily.imgUrl ? localLily.imgUrl : [];
    const imgUrlToRemove = file.url;
    const newImgUrls = imgUrls.filter((url) => url !== imgUrlToRemove);
    try {
      const { data } = await editLily({
        variables: {
          id: localLily.id,
          imgUrl: newImgUrls,
        },
      });
      const newLily = data?.updateLily?.lily;
      if (newLily) {
        setLocalLily(newLily);
      }
    } catch (err) {
      throw err;
    }
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
