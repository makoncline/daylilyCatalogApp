import { InboxOutlined } from "@ant-design/icons";
import { message, Modal, Upload } from "antd";
import axios from "axios";
import React, { useState } from "react";
import slugify from "slugify";

const { Dragger } = Upload;

function getBase64(file: any) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error: any) => reject(error);
  });
}

export const ImgUpload = (props: any) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = props.fileList;

  const handleCancel = () => setPreviewVisible(false);

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  const handleChange = ({ fileList }: any) => {
    let newFileList = fileList.map((file: any) => {
      if (file.response) {
        const url = file.response.url.split("?")[0];
        file.url = url;
      }
      return file;
    });
    newFileList = fileList.filter((file: any) => file.status !== "error");
    if (newFileList.length > 8) {
      newFileList = newFileList.slice(0, 8);
    }
    setFileList(newFileList);
  };

  function getUid(userId: number, name: string) {
    const randomHex = () => Math.floor(Math.random() * 16777215).toString(16);
    const fileNameSlug = slugify(name, {
      remove: /"<>#%\{\}\|\\\^~\[\]`;\?:@=&/g,
    });
    return userId + "/" + randomHex() + "-" + fileNameSlug;
  }
  const handleBeforeUpload = (file: any) => {
    file.uid = getUid(props.user.id, file.name);
    const isJpgOrPng = file.type.startsWith("image/");
    if (!isJpgOrPng) {
      message.error("You can only upload image files!");
      file.status = "error";
    }
    const isLt3M = file.size / 1024 / 1024 < 3;
    if (!isLt3M) {
      message.error("Image must smaller than 3MB!");
      file.status = "error";
    }
    return false;
  };
  const customRequest = (option: any) => {
    const { onSuccess, onError, file, onProgress } = option;
    axios
      .get(`${process.env.ROOT_URL}/api/s3`, {
        params: {
          key: file.uid,
          operation: "put",
        },
      })
      .then((response) => {
        const url = response.data.url;
        axios
          .put(url, file, {
            onUploadProgress: (e) => {
              const progress = Math.round((e.loaded / e.total) * 100);
              onProgress({ percent: progress }, file);
            },
          })
          .then((response) => {
            onSuccess(response.config, file);
          })
          .catch((err) => {
            console.log(err);
            onError(err);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="clearfix">
      <Upload
        customRequest={customRequest}
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        beforeUpload={handleBeforeUpload}
        accept="image/*"
        multiple
      />
      {fileList.length < 8 && !props.isUploading && (
        <Dragger
          customRequest={customRequest}
          showUploadList={false}
          fileList={fileList}
          onChange={handleChange}
          beforeUpload={handleBeforeUpload}
          disabled={props.isUploading || fileList.length >= 8}
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
            Support for a single or bulk upload. Image files under 3mb size
            only.
          </p>
        </Dragger>
      )}
      <Modal visible={previewVisible} footer={null} onCancel={handleCancel}>
        <img alt="example" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
};
