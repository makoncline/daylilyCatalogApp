import { PlusOutlined } from "@ant-design/icons";
import { useCreateUploadUrlMutation } from "@app/graphql";
import { Upload } from "antd";
import { UploadFile, UploadProps } from "antd/lib/upload/interface";
import axios from "axios";
import { UploadRequestOption } from "rc-upload/lib/interface";
import React, { useState } from "react";

const ALLOWED_UPLOAD_CONTENT_TYPES = [
  "image/apng",
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/tiff",
  "image/webp",
];
const accept = ALLOWED_UPLOAD_CONTENT_TYPES.join(",");

export const bucketUrl = `https://${process.env.S3_UPLOAD_BUCKET}.s3.amazonaws.com`;

export function PhotoUpload({
  keys,
  keyPrefix,
  maxCount = 1,
  onSuccess,
  onRemove,
}: {
  keys: string[];
  keyPrefix?: string;
  maxCount?: number;
  onSuccess: (file: UploadFile) => void;
  onRemove: (file: UploadFile) => void;
}) {
  const [createUploadUrl] = useCreateUploadUrlMutation();

  const defaulfFileList: UploadFile<any>[] = keys.filter(Boolean).map((key) => {
    const url = `${bucketUrl}/${key}`;
    return {
      uid: key,
      status: "done",
      url,
      size: 0,
      name: "",
      type: "",
    };
  });
  const [fileList, setFileList] = useState<Array<UploadFile>>(defaulfFileList);

  async function customRequest(options: UploadRequestOption) {
    const { onProgress, onSuccess, onError, action, file } = options;
    if (onProgress && onSuccess && onError) {
      await axios
        .put(action, file, {
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            onProgress({
              ...progressEvent,
              percent: Math.round((loaded / total) * 100),
            });
          },
        })
        .then((response) => {
          onSuccess(response, response.request);
          return response;
        })
        .catch((err) => {
          onError(err);
        });
    }
  }

  async function action(file: UploadFile): Promise<string> {
    const contentType = file.type;
    const { data: uploadUrlData } = await createUploadUrl({
      variables: {
        input: {
          keyPrefix,
          contentType,
        },
      },
    });
    if (uploadUrlData?.createUploadUrl) {
      const { uploadUrl, url, key } = uploadUrlData.createUploadUrl;
      file.url = url;
      file.uid = key;
      return uploadUrl;
    } else {
      return "";
    }
  }

  async function onChange({
    file,
    fileList,
  }: {
    file: UploadFile;
    fileList: Array<UploadFile>;
  }) {
    setFileList(fileList);
    if (file.status === "removed") {
      onRemove(file, fileList);
    } else if (file.status === "uploading") {
    } else if (file.status === "done") {
      onSuccess(file, fileList);
    }
  }

  const props: UploadProps<any> = {
    action,
    accept,
    fileList,
    listType: "picture-card",
    onChange,
    customRequest,
  };
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );
  return (
    <div>
      <Upload {...props}>
        {fileList.length >= maxCount ? null : uploadButton}
      </Upload>
    </div>
  );
}
