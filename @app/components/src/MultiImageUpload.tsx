import { InboxOutlined } from "@ant-design/icons";
import * as Sentry from "@sentry/nextjs";
import { message, Modal, Upload } from "antd";
import { UploadFile, UploadProps } from "antd/lib/upload/interface";
import axios from "axios";
import Image from "next/image";
import React, { useState } from "react";
import slugify from "slugify";

export type RcCustomRequestOptions<T = any> = Parameters<
  Exclude<UploadProps<T>["customRequest"], undefined>
>[0];

const { Dragger } = Upload;

const getBase64: (file: File | Blob) => Promise<string | ArrayBuffer | null> = (
  file
) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const MultiImageUpload = ({
  userId,
  imgUrls,
  afterUpload,
}: {
  userId: number;
  imgUrls: (string | null)[];
  afterUpload: any;
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | undefined>("");
  const [fileList, setFileList] = useState<any>(
    imgUrls
      .map((url: any) => {
        if (!url) return;
        const fileName = url && url.substring(url.lastIndexOf("/") + 1);
        return {
          uid: `${userId}/${fileName}`,
          name: fileName,
          status: "done",
          url,
        };
      })
      .filter(Boolean)
  );

  const handleCancel = () => setPreviewVisible(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      const preview = await getBase64(file.originFileObj);
      if (typeof preview === "string") {
        file.preview = preview;
      }
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  const handleChange = async ({ fileList }: { fileList: UploadFile[] }) => {
    let newFileList = fileList.map((file) => {
      if (file.response && file.response.url) {
        const url = file.response.url.split("?")[0];
        file.url = url;
      }
      return file;
    });
    newFileList = fileList.filter((file) => file.status !== "error");
    if (newFileList.length > 8) {
      newFileList = newFileList.slice(0, 8);
    }
    const imgUrls = newFileList
      .filter((file) => file.status === "done")
      .map((file) => file.url);
    afterUpload(imgUrls);
    await setFileList(newFileList);
  };

  function getUid(userId: number, name: string) {
    const randomHex = () => Math.floor(Math.random() * 16777215).toString(16);
    const fileNameSlug = slugify(name);
    return userId + "/" + randomHex() + "-" + fileNameSlug;
  }

  const handleBeforeUpload = (file: UploadFile) => {
    if (fileList.length >= 8) return false;
    file.uid = getUid(userId, file.name);
    const isImage = file?.type?.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      file.status = "error";
    }
    const isLt3M = file?.size && file.size / 1024 / 1024 < 3;
    if (!isLt3M) {
      message.error("Image file size must smaller than 3MB!");
      file.status = "error";
    }

    return isImage && isLt3M ? true : false;
  };

  const customRequest = async (option: any) => {
    const { onSuccess, onError, file, onProgress } = option;
    // setIsUploading(true);
    try {
      const uploadUrl = await axios
        .get(`${process.env.ROOT_URL}/api/s3`, {
          params: {
            // @ts-ignore
            key: file.uid,
            operation: "put",
          },
        })
        .then((response) => {
          const preSignedUrl = response.data.url;
          return preSignedUrl;
        });

      if (!uploadUrl) {
        throw new Error("Failed to generate upload URL");
      }
      const response = await axios.put(uploadUrl, file, {
        onUploadProgress: (e) => {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress({ percent: progress }, file);
        },
      });
      if (response.config.url) {
        onSuccess(response.config, file);
      }
    } catch (e) {
      console.error(e);
      Sentry.captureException(e);
      onError(e);
    }
    // setIsUploading(false);
  };

  const onRemove: (file: UploadFile) => boolean = (file) => {
    if (file.url) {
      const key = decodeURIComponent(
        file.url.substring(file.url.lastIndexOf("/") + 1)
      );
      axios
        .get(`${process.env.ROOT_URL}/api/s3`, {
          params: {
            key: `${userId + "/" + key}`,
            operation: "delete",
          },
        })
        .then(() => {
          // console.log("deleted");
        })
        .catch((err) => {
          console.error(err);
          Sentry.captureException(err);
        });
    }
    return true;
  };

  return (
    <div className="clearfix">
      <Dragger
        customRequest={customRequest}
        listType="picture-card"
        fileList={fileList}
        onChange={handleChange}
        onRemove={onRemove}
        onPreview={handlePreview}
        beforeUpload={handleBeforeUpload}
        accept="image/*"
        multiple
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single or bulk upload of images up to 3MB file size.
        </p>
      </Dragger>
      <Modal visible={previewVisible} footer={null} onCancel={handleCancel}>
        <Image alt="example" width="100%" src={previewImage} />
      </Modal>
    </div>
  );
};
