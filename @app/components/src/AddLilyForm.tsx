import { QuestionCircleOutlined } from "@ant-design/icons";
import {
  LilyDataFragment,
  ProfileSettingsForm_UserFragment,
  useAddLilyMutation,
  useDeleteLilyMutation,
  useDeleteUploadMutation,
  useEditLilyMutation,
  useListsQuery,
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
import Select from "antd/lib/select";
import { ApolloError } from "apollo-client";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { LilyPhotoUpload } from "./LilyPhotoUpload";
import { getFileListFromUrls } from "./PhotoUpload";

const { TextArea } = Input;
const { Option } = Select;
export interface FormValues {
  name: string;
  imgUrl: string[];
  price: number;
  publicNote: string;
  privateNote: string;
  ahsId: string;
  listId: number;
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
  updateLily?: LilyDataFragment | null;
  setUpdateLily: (val: LilyDataFragment | null) => void;
  user: ProfileSettingsForm_UserFragment;
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
  const [dataSource, setDataSource] = useState<Array<ILily>>([]);
  const [form] = Form.useForm();
  const { setFieldsValue } = form;
  const focusElement = useRef<HTMLSelectElement>(null);
  const { data } = useListsQuery();
  const lists = data?.currentUser?.lists.nodes;
  const [deleteUpload] = useDeleteUploadMutation();
  const lilyPhotoUrls = updateLily?.imgUrl
    ? (updateLily.imgUrl as Array<string>)
    : [];
  const [fileList, setFileList] = useState(
    lilyPhotoUrls ? getFileListFromUrls(lilyPhotoUrls) : []
  );

  useEffect(() => {
    if (updateLily) {
      setFieldsValue({ name: updateLily.name });
      setFieldsValue({ list: updateLily.list ? updateLily.list.id : 0 });
      setFieldsValue({ price: updateLily.price });
      setFieldsValue({ ahsId: updateLily.ahsId });
      setFieldsValue({ publicNote: updateLily.publicNote });
      setFieldsValue({ privateNote: updateLily.privateNote });
      const lilyPhotoUrls = updateLily.imgUrl
        ? (updateLily.imgUrl as Array<string>)
        : [];
      setFileList(lilyPhotoUrls ? getFileListFromUrls(lilyPhotoUrls) : []);
    }
  }, [updateLily, id, setFieldsValue]);

  useEffect(() => {
    if (!updateLily) {
      if (focusElement.current) {
        focusElement.current!.focus();
      }
    }
  }, [show, updateLily]);

  const handleCancel = () => {
    resetForm();
    onComplete();
  };

  const resetForm = useCallback(() => {
    setUpdateLily(null);
    setFileList([]);
    setDataSource([]);
    setError(null);
    setShow(false);
    form.resetFields();
  }, [setFileList, setUpdateLily, setDataSource, setError, setShow, form]);

  async function handelAdd() {
    try {
      const {
        name,
        price,
        publicNote,
        privateNote,
        ahsId,
        list,
      } = await form.validateFields();
      const { data } = await addLily({
        variables: {
          name: name,
          price: price || null,
          publicNote: publicNote || null,
          privateNote: privateNote || null,
          ahsId: ahsId || null,
          listId: list || null,
        },
      });
      const lily = data?.createLily?.lily;
      if (lily) {
        setUpdateLily(lily);
      }
      message.success(`Daylily ${name} added`);
    } catch (err) {
      setError(err);
    }
  }

  async function handleSave() {
    if (updateLily) {
      try {
        const {
          name,
          price,
          publicNote,
          privateNote,
          ahsId,
          list,
        } = await form.validateFields();
        await editLily({
          variables: {
            id: updateLily.id,
            name: name,
            price: price || null,
            publicNote: publicNote || null,
            privateNote: privateNote || null,
            ahsId: ahsId || null,
            listId: list || null,
          },
        });
        message.success(`Daylily ${name} Updated`);
      } catch (err) {
        setError(err);
      }
    }
  }
  interface ILily {
    id: number;
    name: string;
    image: string;
  }

  const onSearch = async (searchText: string) => {
    if (searchText.length >= 2) {
      const searchResult = await searchAhs(searchText);
      setDataSource(searchResult);
    } else {
      setDataSource([]);
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

  function onSelect(value: string): void {
    const selection = dataSource.filter(
      (item: ILily) => item.name === value
    )[0];
    setFieldsValue({ ahsId: `${selection.id}` });
    setDataSource([]);
  }

  async function deleteImages(): Promise<boolean> {
    for (let file of fileList) {
      try {
        await deleteUpload({
          variables: {
            input: {
              key: file.uid,
            },
          },
        });
      } catch (err) {
        console.log(`Error deleting file: `, file);
        return false;
      }
    }
    return true;
  }

  const handleDelete = async (id: number) => {
    try {
      if (await deleteImages()) {
        await deleteLily({ variables: { id } });
        resetForm();
        handleCancel();
        message.success("Daylily deleted");
      }
    } catch (err) {
      console.log(`Error deleting daylily: `, id);
      setError(err);
    }
  };

  return (
    <Modal
      visible={show}
      title={updateLily ? "Edit Daylily" : "Add a new Daylily"}
      onOk={handleSave}
      style={{ top: 20 }}
      onCancel={handleCancel}
      footer={
        updateLily
          ? [
              <Popconfirm
                key={1}
                title="Are you sure delete this daylily?"
                onConfirm={() => handleDelete(updateLily.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="primary" danger style={{ float: "left" }}>
                  Delete
                </Button>
              </Popconfirm>,
              <Button key={2} onClick={handleCancel}>
                CLOSE
              </Button>,
              <Button key={3} type="primary" onClick={handleSave}>
                SAVE
              </Button>,
            ]
          : [
              <Button key={1} onClick={handleCancel}>
                CLOSE
              </Button>,
              <Button key={2} type="primary" onClick={handelAdd}>
                SAVE
              </Button>,
            ]
      }
    >
      <Form
        {...formItemLayout}
        form={form}
        onFinish={handleSave}
        initialValues={{ list: 0 }}
      >
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
            onBlur={() => setDataSource([])}
            allowClear
          />
        </Form.Item>
        <Form.Item
          label={
            <span data-cy="addLilyForm-list-label">
              List&nbsp;
              <Tooltip title="Add this daylily to a list, if you'd like.">
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          name="list"
        >
          <Select data-cy="addLilyForm-input-list">
            <Option key="none" value={0}>
              None
            </Option>
            {lists &&
              lists.map((list, i) => (
                <Option key={i} value={list.id}>
                  {list.name}
                </Option>
              ))}
          </Select>
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
          <TextArea data-cy="settingslilies-input-ahsId" autoSize />
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
          />
        </Form.Item>
        {updateLily && (
          <>
            <fieldset disabled={!user.isVerified}>
              <LilyPhotoUpload
                lily={updateLily}
                fileList={fileList}
                setFileList={setFileList}
              />
            </fieldset>
            {!user.isVerified && (
              <p>You must verify your email address to upload photos.</p>
            )}
          </>
        )}
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
