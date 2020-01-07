import React, { useState } from "react";
import { Upload, Icon, Modal } from "antd";
import axios from "axios";

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
    const newFileList = fileList.map((file: any) => {
      if (file.response) {
        const url = file.response.url.split("?")[0];
        file.url = url;
      }
      return file;
    });
    setFileList(newFileList);
  };

  const handleRemove = (file: any) => {
    axios
      .get(`${process.env.ROOT_URL}/api/s3`, {
        params: {
          key: file.uid + "." + file.name.split(".")[1],
          operation: "delete",
        },
      })
      .then(() => {
        console.log("item deleted");
      })
      .catch(error => {
        console.log(JSON.stringify(error));
      });
  };
  const customRequest = (option: any) => {
    const { onSuccess, onError, file, onProgress } = option;
    axios
      .get(`${process.env.ROOT_URL}/api/s3`, {
        params: {
          key: file.uid + "." + file.name.split(".")[1],
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
        onRemove={handleRemove}
      >
        {fileList.length >= 8 ? null : uploadButton}
      </Upload>
      <Modal visible={previewVisible} footer={null} onCancel={handleCancel}>
        <img alt="example" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
};
export default PicturesWall;
