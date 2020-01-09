import React, { useState } from "react";
import { Upload, Icon, Modal, message } from "antd";
import axios from "axios";
import slugify from "slugify";

function getBase64(file: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

const PicturesWall = (props: any) => {
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
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG or PNG images!");
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
      .then(response => {
        const url = response.data.url;
        axios
          .put(url, file, {
            onUploadProgress: e => {
              const progress = Math.round((e.loaded / e.total) * 100);
              onProgress({ percent: progress }, file);
            },
          })
          .then(response => {
            onSuccess(response.config, file);
          })
          .catch(err => {
            console.log(err);
            onError(err);
          });
      })
      .catch(error => {
        console.log(error);
      });
  };

  const uploadButton = (
    <div>
      <Icon type="plus" />
      <div className="ant-upload-text">Upload</div>
    </div>
  );

  return (
    <div className="clearfix">
      <Upload
        customRequest={customRequest}
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        beforeUpload={handleBeforeUpload}
        disabled={props.isUploading}
      >
        {fileList.length >= 8 || props.isUploading ? null : uploadButton}
      </Upload>
      <Modal visible={previewVisible} footer={null} onCancel={handleCancel}>
        <img alt="example" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
};
export default PicturesWall;
