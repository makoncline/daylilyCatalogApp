import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  useAddLilyMutation,
  useEditLilyMutation,
  Lily,
  useDeleteLilyMutation,
} from "@app/graphql";
import {
  Alert,
  Form,
  Input,
  Modal,
  InputNumber,
  Button,
  message,
  Popconfirm,
} from "antd";
import { promisify } from "util";
import { FormComponentProps, ValidateFieldsOptions } from "antd/lib/form/Form";
import { ApolloError } from "apollo-client";
import { getCodeFromError, extractError } from "../errors";
import { AutoComplete } from "antd";
import ImgUpload from "../components/ImgUpload";
import axios from "axios";

const { TextArea } = Input;
interface FormValues {
  name: string;
  imgUrl: string[];
  price: number;
  publicNote: string;
  privateNote: string;
  ahsId: string;
}

interface AddLilyFormProps extends FormComponentProps<FormValues> {
  onComplete: () => void;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
  show: boolean;
  setShow: (val: boolean) => void;
  updateLily?: Lily | null;
  setUpdateLily: (val: any) => void;
  user: any;
}

function AddLilyForm({
  form,
  error,
  setError,
  onComplete,
  show,
  setShow,
  updateLily,
  setUpdateLily,
  user,
}: AddLilyFormProps) {
  const [addLily] = useAddLilyMutation();
  const [editLily] = useEditLilyMutation();
  const [deleteLily] = useDeleteLilyMutation();
  const [fileList, setFileList] = useState<any>([]);
  const [dataSource, setDataSource] = useState<Array<ILily>>([]);
  const [isUploading, setIsUploading] = useState(false);
  useEffect(() => {
    if (updateLily && updateLily.imgUrl) {
      setFileList(
        updateLily.imgUrl.map((url: any) => {
          const fileName = url && url.substring(url.lastIndexOf("/") + 1);
          return {
            uid: `${user.id}/${fileName}`,
            name: fileName,
            status: "done",
            url,
          };
        })
      );
    }
  }, [updateLily, user.id]);

  const validateFields: (
    fieldNames?: Array<string>,
    options?: ValidateFieldsOptions
  ) => Promise<FormValues> = useMemo(
    () => promisify((...args) => form.validateFields(...args)),
    [form]
  );
  const handleCancle = () => {
    if (isUploading) return;
    setShow(false);
    setUpdateLily(null);
    form.resetFields();
    setFileList([]);
    setDataSource([]);
  };

  const handleImgUpload = useCallback(
    async (file: any, i: number) => {
      return await axios
        .get(`${process.env.ROOT_URL}/api/s3`, {
          params: {
            key: file.uid,
            operation: "put",
          },
        })
        .then(async response => {
          const url = response.data.url;
          return await axios
            .put(url, file.originFileObj, {
              onUploadProgress: e => {
                const progress = Math.round((e.loaded / e.total) * 100);
                const newFileList = fileList.slice();
                newFileList[i].status = "uploading";
                newFileList[i].percent = progress;
                setFileList(newFileList);
              },
            })
            .then(response => {
              console.log("success", response);
              const newFileList = fileList.slice();
              newFileList[i].status = "done";
              setFileList(newFileList);
              return (
                response &&
                response.config &&
                response.config.url &&
                response.config.url.split("?")[0]
              );
            })
            .catch(err => {
              console.log(err);
              throw new Error(err);
            });
        })
        .catch(err => {
          console.log(err);
          throw new Error(err);
        });
    },
    [fileList]
  );
  const handleImgDelete = useCallback(
    (url: any) => {
      const fileName = url && url.substring(url.lastIndexOf("/") + 1);
      axios
        .get(`${process.env.ROOT_URL}/api/s3`, {
          params: {
            key: `${user.id}/${fileName}`,
            operation: "delete",
          },
        })
        .then(() => {
          console.log("item deleted");
        })
        .catch(error => {
          console.log(JSON.stringify(error));
        });
    },
    [user.id]
  );
  const handleImages = useCallback(async () => {
    setIsUploading(true);
    if (updateLily && updateLily.imgUrl) {
      const prevImgUrls = updateLily.imgUrl;
      const imgToDelete = prevImgUrls.filter((url: any) => {
        return !fileList.some((file: any) => file.url === url);
      });
      imgToDelete.forEach((url: any) => handleImgDelete(url));
    }
    //add any new files
    const isDone = await Promise.all(
      fileList
        .filter((file: any) => file.status !== "error")
        .map((file: any, i: number) => {
          if (!file.url) {
            return handleImgUpload(file, i);
          }
        })
        .filter((file: any) => file)
    );
    setIsUploading(false);
    return isDone;
  }, [fileList, handleImgUpload, updateLily, handleImgDelete]);

  const handleSubmit = useCallback(
    async e => {
      e.preventDefault();
      try {
        setError(null);
        const values = await validateFields();
        const prevImgUrls = fileList
          .filter((file: any) => file.url)
          .map((file: any) => file.url);
        const newImgUrls: any = await handleImages();
        const imgUrls = [...prevImgUrls, ...(await newImgUrls)];
        if (updateLily) {
          await editLily({
            variables: {
              id: updateLily.id,
              imgUrl: imgUrls,
              name: values.name,
              price: values.price || null,
              publicNote: values.publicNote || null,
              privateNote: values.privateNote || null,
              ahsId: values.ahsId || null,
            },
          });
        } else {
          await addLily({
            variables: {
              imgUrl: imgUrls,
              name: values.name,
              price: values.price || null,
              publicNote: values.publicNote || null,
              privateNote: values.privateNote || null,
              ahsId: values.ahsId || null,
            },
          });
        }
        const messageText = updateLily ? "Daylily edited" : "Daylily added";
        message.success(messageText);
        setShow(false);
        form.resetFields();
        setUpdateLily(null);
        setFileList([]);
        setDataSource([]);
        onComplete();
      } catch (e) {
        setError(e);
      }
    },
    [
      setError,
      validateFields,
      fileList,
      handleImages,
      updateLily,
      setShow,
      form,
      setUpdateLily,
      onComplete,
      editLily,
      addLily,
    ]
  );

  const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
  const code = getCodeFromError(error);
  interface ILily {
    id: number;
    name: string;
    image: string;
  }

  const onSearch = async (searchText: string) => {
    if (searchText.length >= 3) {
      const searchResult = await searchAhs(searchText);
      setDataSource(searchResult);
    }
  };

  async function searchAhs(searchText: string) {
    try {
      const response = await fetch(
        `https://data.daylilycatalog.com/ahs/search/${searchText}`
      );
      const resJson = await response.json();
      return resJson || [];
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  function onSelect(value: any) {
    const selection = dataSource.filter(
      (item: ILily) => item.name === value
    )[0];
    const imgVal = getFieldValue("imgUrl");
    if (!imgVal) {
      setFieldsValue({ imgUrl: selection.image });
    }
    setFieldsValue({ ahsId: selection.id + "" });
    setFileList([
      ...fileList,
      {
        uid: -fileList.length,
        name: selection.name,
        status: "done",
        url: selection.image,
      },
    ]);
    setDataSource([]);
  }

  const handleDelete = async (id: any) => {
    fileList.forEach((file: any) => handleImgDelete(file.url));
    deleteLily({ variables: { id } });
    setShow(false);
    handleCancle();
    message.success("Daylily deleted");
  };
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 19 },
    },
  };

  return (
    <Modal
      visible={show}
      title={updateLily ? "Edit Daylily" : "Add a new Daylily"}
      onOk={handleSubmit}
      style={{ top: 20 }}
      onCancel={handleCancle}
      footer={
        updateLily
          ? [
              <Popconfirm
                key={1}
                title="Are you sure delete this daylily?"
                onConfirm={() => handleDelete(updateLily.id)}
                okText="Yes"
                cancelText="No"
                disabled={isUploading}
              >
                <Button
                  type="danger"
                  style={{ float: "left" }}
                  disabled={isUploading}
                >
                  Delete
                </Button>
              </Popconfirm>,
              <Button key={2} onClick={handleCancle} disabled={isUploading}>
                Cancel
              </Button>,
              <Button
                key={3}
                type="primary"
                onClick={handleSubmit}
                loading={isUploading}
              >
                {isUploading ? "Uploading, please wait." : "OK"}
              </Button>,
            ]
          : [
              <Button key={1} onClick={handleCancle} disabled={isUploading}>
                Cancel
              </Button>,
              <Button
                key={2}
                type="primary"
                onClick={handleSubmit}
                loading={isUploading}
              >
                {isUploading ? "Uploading, please wait." : "OK"}
              </Button>,
            ]
      }
    >
      <Form onSubmit={handleSubmit} {...formItemLayout}>
        <Form.Item label="Name" style={{ marginBottom: 5 }}>
          {getFieldDecorator("name", {
            initialValue: updateLily ? updateLily.name : "",
            rules: [
              {
                required: true,
                message: "Please enter a daylily name",
              },
            ],
          })(
            <AutoComplete
              dataSource={dataSource.map((item: ILily) => item.name)}
              onSearch={onSearch}
              onSelect={onSelect}
              allowClear
              disabled={isUploading}
            />
          )}
        </Form.Item>
        <Form.Item label="AHS ID" style={{ display: "none" }}>
          {getFieldDecorator("ahsId", {
            initialValue: updateLily ? updateLily.ahsId : "",
            rules: [
              {
                required: false,
                message: "Enter an AHS ID, if you'd like.",
              },
            ],
          })(
            <TextArea
              data-cy="settingslilies-input-ahsId"
              autoSize
              disabled={isUploading}
            />
          )}
        </Form.Item>
        <Form.Item label="Price" style={{ marginBottom: 5 }}>
          {getFieldDecorator("price", {
            initialValue: updateLily ? updateLily.price : "",
            rules: [
              {
                required: false,
                message: "Enter a price, if you'd like.",
              },
            ],
          })(
            <InputNumber
              style={{ width: "100%" }}
              formatter={value =>
                value ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
              }
              parser={value => `${value}`.replace(/\$\s?|(,*)/g, "")}
              precision={2}
              data-cy="settingslilies-input-price"
              disabled={isUploading}
            />
          )}
        </Form.Item>
        <Form.Item label="Public note" style={{ marginBottom: 5 }}>
          {getFieldDecorator("publicNote", {
            initialValue: updateLily ? updateLily.publicNote : "",
            rules: [
              {
                required: false,
                message: "Enter a public note, if you'd like.",
              },
            ],
          })(
            <TextArea
              data-cy="settingslilies-input-publicNote"
              autoSize={{ minRows: 2 }}
              disabled={isUploading}
            />
          )}
        </Form.Item>
        <Form.Item label="Private note" style={{ marginBottom: 5 }}>
          {getFieldDecorator("privateNote", {
            initialValue: updateLily ? updateLily.privateNote : "",
            rules: [
              {
                required: false,
                message: "Enter a private note, if you'd like.",
              },
            ],
          })(
            <TextArea
              data-cy="settingslilies-input-privateNote"
              autoSize={{ minRows: 2 }}
              disabled={isUploading}
            />
          )}
        </Form.Item>
        <ImgUpload
          fileList={[fileList, setFileList]}
          user={user}
          isUploading={isUploading}
        />
        {error ? (
          <Form.Item>
            <Alert
              type="error"
              message={`Error adding daylily`}
              description={
                <span>
                  {extractError(error).message}
                  {code ? (
                    <span>
                      {" "}
                      (Error code: <code>ERR_{code}</code>)
                    </span>
                  ) : null}
                </span>
              }
            />
          </Form.Item>
        ) : null}
      </Form>
    </Modal>
  );
}

const WrappedAddLilyForm = Form.create<AddLilyFormProps>({
  name: "addLilyForm",
  onValuesChange(props) {
    props.setError(null);
  },
})(AddLilyForm);

export default WrappedAddLilyForm;
