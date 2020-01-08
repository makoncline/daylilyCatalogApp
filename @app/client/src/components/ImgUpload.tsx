import React, { useState } from "react";
import { Upload, Icon, Modal } from "antd";
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
    const newFileList = fileList.map((file: any) => {
      if (file.response) {
        const url = file.response.url.split("?")[0];
        file.url = url;
      }
      return file;
    });
    console.log(newFileList);
    setFileList(newFileList);
  };

  // const handleRemove = (file: any) => {
  //   console.log(file.uid);
  //   axios
  //     .get(`${process.env.ROOT_URL}/api/s3`, {
  //       params: {
  //         key: file.uid,
  //         operation: "delete",
  //       },
  //     })
  //     .then(() => {
  //       console.log("item deleted");
  //     })
  //     .catch(error => {
  //       console.log(JSON.stringify(error));
  //     });
  // };
  function getUid(userId: number, name: string) {
    const randomHex = () => Math.floor(Math.random() * 16777215).toString(16);
    const fileNameSlug = slugify(name, {
      remove: /"<>#%\{\}\|\\\^~\[\]`;\?:@=&/g,
    });
    return userId + "/" + randomHex() + "-" + fileNameSlug;
  }
  const handleBeforeUpload = (file: any) => {
    file.uid = getUid(props.user.id, file.name);
    return false;
  };
  const customRequest = (option: any) => {
    const { onSuccess, onError, file, onProgress } = option;
    console.log(file.uid);
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
