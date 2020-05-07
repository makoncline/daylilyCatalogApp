import { QuestionCircleOutlined } from "@ant-design/icons";
import {
  Lily,
  useAddLilyMutation,
  useDeleteLilyMutation,
  useEditLilyMutation,
} from "@app/graphql";
import { extractError, formItemLayout, getCodeFromError } from "@app/lib";
import {
  Alert,
  AutoComplete,
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Tooltip,
} from "antd";
import Select, { SelectValue } from "antd/lib/select";
import { ApolloError } from "apollo-client";
import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { ImgUpload } from "./ImgUpload";

const { TextArea } = Input;
export interface FormValues {
  name: string;
  imgUrl: string[];
  price: number;
  publicNote: string;
  privateNote: string;
  ahsId: string;
}
export interface User {
  id: number;
}
export interface AddLilyFormProps {
  onComplete: () => void;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
  show: boolean;
  setShow: (val: boolean) => void;
  updateLily?: Lily | null;
  setUpdateLily: (val: any) => void;
  user: User;
}

export const AddLilyForm = ({
  error,
  setError,
  onComplete,
  show,
  setShow,
  updateLily,
  setUpdateLily,
  user,
}: AddLilyFormProps) => {
  const id = user.id;
  const [addLily] = useAddLilyMutation();
  const [editLily] = useEditLilyMutation();
  const [deleteLily] = useDeleteLilyMutation();
  const [fileList, setFileList] = useState<any>([]);
  const [dataSource, setDataSource] = useState<Array<ILily>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [form] = Form.useForm();
  const { setFieldsValue, getFieldValue } = form;
  const focusElement = useRef<Select<SelectValue>>(null);

  useEffect(() => {
    if (updateLily) {
      setFieldsValue({ name: updateLily?.name });
      setFieldsValue({ price: updateLily?.price });
      setFieldsValue({ ahsId: updateLily?.ahsId });
      setFieldsValue({ publicNote: updateLily?.publicNote });
      setFieldsValue({ privateNote: updateLily?.privateNote });
      if (updateLily.imgUrl && updateLily.imgUrl.length) {
        setFileList(
          updateLily.imgUrl.map((url: any) => {
            const fileName = url && url.substring(url.lastIndexOf("/") + 1);
            return {
              uid: `${id}/${fileName}`,
              name: fileName,
              status: "done",
              url,
            };
          })
        );
      }
    }
  }, [updateLily, id, setFieldsValue]);

  useEffect(() => {
    if (!updateLily) {
      if (focusElement.current) {
        focusElement.current!.focus();
      }
    }
  }, [show, updateLily]);

  useEffect(() => {
    setIsUploading(false);
  }, [error]);

  const handleCancle = () => {
    if (isUploading) return;
    resetForm();
  };

  const resetForm = useCallback(() => {
    setFileList([]);
    setIsUploading(false);
    setUpdateLily(null);
    setDataSource([]);
    setError(null);
    setShow(false);
    form.resetFields();
  }, [
    setFileList,
    setIsUploading,
    setUpdateLily,
    setDataSource,
    setError,
    setShow,
    form,
  ]);

  const handleImgUpload = useCallback(
    async (file: any, i: number) => {
      return await axios
        .get(`${process.env.ROOT_URL}/api/s3`, {
          params: {
            key: file.uid,
            operation: "put",
          },
        })
        .then(async (response) => {
          const url = response.data.url;
          return await axios
            .put(url, file.originFileObj, {
              onUploadProgress: (e) => {
                const progress = Math.round((e.loaded / e.total) * 100);
                const newFileList = fileList.slice();
                newFileList[i].status = "uploading";
                newFileList[i].percent = progress;
                setFileList(newFileList);
              },
            })
            .then((response) => {
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
            .catch((err) => {
              console.log(err);
              throw new Error(err);
            });
        })
        .catch((err) => {
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
            key: `${id}/${fileName}`,
            operation: "delete",
          },
        })
        .then(() => {
          //console.log("item deleted");
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
        });
    },
    [id]
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
    async (e) => {
      e.preventDefault();
      try {
        setError(null);
        const values = await form.validateFields();
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
        resetForm();
        onComplete();
      } catch (e) {
        setError(e);
      }
    },
    [
      setError,
      fileList,
      handleImages,
      resetForm,
      form,
      updateLily,
      onComplete,
      editLily,
      addLily,
    ]
  );

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
    setFieldsValue({ ahsId: "" });
  };

  async function searchAhs(searchText: string) {
    try {
      // @ts-ignore
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
    console.log(selection);
    const imgVal = getFieldValue("imgUrl");
    if (!imgVal) {
      setFieldsValue({ imgUrl: selection.image });
    }
    setFieldsValue({ ahsId: selection.id + "" });
    if (selection.image) {
      if (!fileList.some((file: any) => file.url === selection.image)) {
        setFileList([
          ...fileList,
          {
            uid: -fileList.length,
            name: selection.name,
            status: "done",
            url: selection.image,
          },
        ]);
      }
    }
    setDataSource([]);
  }

  const handleDelete = async (id: any) => {
    fileList.forEach((file: any) => handleImgDelete(file.url));
    deleteLily({ variables: { id } });
    resetForm();
    handleCancle();
    message.success("Daylily deleted");
  };

  return (
    <Modal
      forceRender
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
              <Button type='primary' danger style={{ float: "left" }} disabled={isUploading}>
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
              {isUploading ? "Uploading, please wait." : "SAVE"}
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
      <Form {...formItemLayout} form={form} onFinish={handleSubmit}>
        <Form.Item
          label={
            <span data-cy="addLilyForm-name-label">
              Name&nbsp;
              <Tooltip title="Enter the name of the daylily. Select a registered cultivar from the drop down list to link registration data and, possibly, a photo">
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          name="name"
          rules={[
            {
              required: true,
              message: "Please enter a name for this daylily",
            },
          ]}
        >
          <AutoComplete
            data-cy="addLilyForm-input-name"
            ref={focusElement}
            options={dataSource.map((item: ILily) => {
              return { value: item.name };
            })}
            onSearch={onSearch}
            onSelect={onSelect}
            allowClear
            disabled={isUploading}
          />
        </Form.Item>
        <Form.Item
          style={{ display: "none" }}
          label={
            <span data-cy="addLilyForm-ahsId-label">
              AHS ID&nbsp;
              <Tooltip title="Enter an AHS ID, if you'd like.">
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          name="ahsId"
        >
          <TextArea
            data-cy="settingslilies-input-ahsId"
            autoSize
            disabled={isUploading}
          />
        </Form.Item>

        <Form.Item
          label={
            <span data-cy="addLilyForm-price-label">
              Price&nbsp;
              <Tooltip title="Enter a price for this daylily. If you do not enter a price, the daylily will be listed as 'Display Only' in your public catalog">
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          name="price"
        >
          <InputNumber
            formatter={(value) =>
              value ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
            }
            parser={(value) => `${value}`.replace(/\$\s?|(,*)/g, "")}
            precision={2}
            data-cy="addLilyForm-input-price"
            disabled={isUploading}
          />
        </Form.Item>
        <Form.Item
          label={
            <span data-cy="addLilyForm-publicNote-label">
              Public Note&nbsp;
              <Tooltip title="Enter a public note or description of this daylily. This will be the description for the listing in your public catalog.">
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          name="publicNote"
        >
          <TextArea
            data-cy="addLilyForm-input-publicNote"
            autoSize={{ minRows: 2 }}
            disabled={isUploading}
          />
        </Form.Item>
        <Form.Item
          label={
            <span data-cy="addLilyForm-privateNote-label">
              Private Note&nbsp;
              <Tooltip title="Enter a private note for this daylily. This note will only be visiable to you.">
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          name="privateNote"
        >
          <TextArea
            data-cy="addLilyForm-input-privateNote"
            autoSize={{ minRows: 2 }}
            disabled={isUploading}
          />
        </Form.Item>
        <ImgUpload
          fileList={[fileList, setFileList]}
          user={user}
          isUploading={isUploading}
        />
        {error ? (
          <Form.Item label="Error">
            <Alert
              type="error"
              message={`Saving daylily failed`}
              description={
                <span>
                  {extractError(error).message}
                  {getCodeFromError(error) ? (
                    <span>
                      {" "}
                      (Error code: <code>ERR_{getCodeFromError(error)}</code>)
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
};
