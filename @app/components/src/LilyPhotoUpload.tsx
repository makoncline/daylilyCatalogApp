import {
  LilyDataFragment,
  useDeleteUploadMutation,
  useEditLilyMutation,
} from "@app/graphql";
import { UploadFile } from "antd/lib/upload/interface";
import React from "react";

import { PhotoUpload } from "./PhotoUpload";

export const LilyPhotoUpload = ({
  lily,
  setLily,
  fileList,
  setFileList,
}: {
  lily: LilyDataFragment;
  setLily: (val: LilyDataFragment | null) => void;
  fileList: UploadFile<any>[];
  setFileList: (fileList: UploadFile<any>[]) => void;
}) => {
  const [deleteUpload] = useDeleteUploadMutation();
  const [editLily] = useEditLilyMutation();

  const onSuccess = async (file: UploadFile) => {
    const imgUrls = lily.imgUrl ? lily.imgUrl : [];
    const newImgUrls = file.url ? imgUrls.concat(file.url) : imgUrls;
    try {
      const { data } = await editLily({
        variables: {
          id: lily.id,
          imgUrl: newImgUrls,
        },
      });
      const newLily = data?.updateLily?.lily;
      if (newLily) {
        setLily(newLily);
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
    const imgUrls = lily.imgUrl ? lily.imgUrl : [];
    const imgUrlToRemove = file.url;
    const newImgUrls = imgUrls.filter((url) => url !== imgUrlToRemove);
    try {
      const { data } = await editLily({
        variables: {
          id: lily.id,
          imgUrl: newImgUrls,
        },
      });
      const newLily = data?.updateLily?.lily;
      if (newLily) {
        setLily(newLily);
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
