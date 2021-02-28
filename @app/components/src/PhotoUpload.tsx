import { PlusOutlined } from "@ant-design/icons";
import { useCreateUploadUrlMutation } from "@app/graphql";
import s3Uri from "amazon-s3-uri";
import { Modal, Upload } from "antd";
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

export function getKeyFromS3Url(url: string): string {
  try {
    return s3Uri(url).key;
  } catch (err) {
    console.log(`Error: ${url} is not a valid s3 url.`);
    return "";
  }
}

export function getS3UrlFromKey(key: string): string {
  const bucketUrl = `https://${process.env.S3_UPLOAD_BUCKET}.s3.amazonaws.com`;
  return `${bucketUrl}/${key}`;
}

export function getFileListFromKeys(keys: Array<string>): UploadFile<any>[] {
  return keys.filter(Boolean).map((key) => {
    const url = getS3UrlFromKey(key);
    return {
      uid: key,
      status: "done",
      url,
      size: 0,
      name: "",
      type: "",
    };
  });
}

export function PhotoUpload({
  keyPrefix,
  maxCount = 1,
  onSuccess,
  onRemove,
  fileList,
  setFileList,
}: {
  keyPrefix?: string;
  maxCount?: number;
  onSuccess: (file: UploadFile) => void;
  onRemove: (file: UploadFile) => void;
  fileList: UploadFile<any>[];
  setFileList: (fileList: UploadFile<any>[]) => void;
}) {
  const [createUploadUrl] = useCreateUploadUrlMutation();

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

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
      onRemove(file);
    } else if (file.status === "uploading") {
    } else if (file.status === "done") {
      onSuccess(file);
    }
  }

  function onPreview(file: UploadFile) {
    if (file.url) {
      setPreviewImage(file.url);
      setPreviewVisible(true);
    }
  }

  const props: UploadProps<any> = {
    action,
    accept,
    fileList,
    listType: "picture-card",
    onChange,
    customRequest,
    onPreview,
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
      <Modal
        visible={previewVisible}
        title={null}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview image" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
}
