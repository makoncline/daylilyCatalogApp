import { QuestionCircleOutlined } from "@ant-design/icons";
import { ApolloError } from "@apollo/client";
import {
  LilyDataFragment,
  ProfileSettingsForm_UserFragment,
  useAddLilyMutation,
  useDeleteLilyMutation,
  useDeleteUploadMutation,
  useEditLilyMutation,
  useListsQuery,
  useSearchAhsLiliesLazyQuery,
} from "@app/graphql";
import { extractError, formItemLayout, getCodeFromError } from "@app/lib";
import {
  Alert,
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Tooltip,
  Typography,
} from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { AhsCard } from "./AhsCard";
import { LilyPhotoUpload } from "./LilyPhotoUpload";
import { getFileListFromUrls } from "./PhotoUpload";

const { Text } = Typography;
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
  const { setFieldsValue, getFieldValue } = form;
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
  const [searchAhsLilies, { data: searchData }] = useSearchAhsLiliesLazyQuery({
    variables: {
      search: "",
    },
  });

  useEffect(() => {
    setDataSource(searchData?.searchAhsLilies?.nodes ?? []);
  }, [searchData]);

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
      setAhsId(updateLily.ahsId || "");
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
    setAhsId("");
    form.resetFields();
  }, [setFileList, setUpdateLily, setDataSource, setError, setShow, form]);

  async function handelAdd() {
    try {
      const { name, price, publicNote, privateNote, ahsId, list } =
        await form.validateFields();
      const { data } = await addLily({
        variables: {
          name: name,
          price: price || null,
          publicNote: publicNote || null,
          privateNote: privateNote || null,
          ahsId: ahsId || null,
          listId: list || null,
          imgUrl: [],
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
        const { name, price, publicNote, privateNote, ahsId, list } =
          await form.validateFields();
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
    ahsId: number;
    name: string | null;
    image: string | null;
  }

  const onSearch = async (searchText: string) => {
    if (searchText.length >= 2) {
      searchAhsLilies({
        variables: {
          search: searchText,
        },
      });
    } else {
      setDataSource([]);
    }
    setFieldsValue({ ahsId: "" });
  };

  function onSelect(value: string): void {
    if (!value) {
      return;
    }
    const selection = dataSource.filter(
      (item: ILily) => item.name === value
    )[0];
    setFieldsValue({ ahsId: `${selection.ahsId}` });
    setAhsId(selection.ahsId + "");
    const name = getFieldValue("name");
    if (!name) {
      setFieldsValue({ name: selection.name });
    }
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

  const [ahsId, setAhsId] = useState("");

  function handleUnlink() {
    setFieldsValue({ ahsId: null, "ahs-lily": null });
    setAhsId(getFieldValue("ahsId"));
  }
  const isActive =
    user.stripeSubscription?.subscriptionInfo?.status == "active";
  const isFree = user.freeUntil ? new Date() < new Date(user.freeUntil) : false;
  const isPhotoUploadActive = user.isVerified && (isFree || isActive);
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
                Close
              </Button>,
              <Button key={3} type="primary" onClick={handleSave}>
                Save
              </Button>,
            ]
          : [
              <Button key={1} onClick={handleCancel}>
                Close
              </Button>,
              <Button key={2} type="primary" onClick={handelAdd}>
                Save
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
        {!ahsId && (
          <Form.Item
            label={
              <span data-cy="addLilyForm-ahs-lily-label">
                Link to&nbsp;
                <Tooltip title="Type the name of a registered cultivar to link registration data and, possibly, a photo">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            name="ahs-lily"
          >
            <Select
              showSearch
              defaultActiveFirstOption={false}
              showArrow={false}
              filterOption={false}
              onSearch={onSearch}
              onChange={onSelect}
              notFoundContent={null}
              onBlur={() => setDataSource([])}
              allowClear
            >
              {dataSource.map((item: ILily) => (
                <Option key={item.ahsId} value={item.name!!}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
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
          <Input />
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
        <Form.Item style={{ display: "none" }} label="AHS ID" name="ahsId">
          <Input data-cy="settingslilies-input-ahsId" />
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
        {ahsId && (
          <div style={{ marginBottom: "1rem" }}>
            <AhsCard ahsId={ahsId} handleUnlink={handleUnlink} />
          </div>
        )}
        {updateLily && (
          <>
            <fieldset disabled={!isPhotoUploadActive}>
              <LilyPhotoUpload
                lily={updateLily}
                setLily={setUpdateLily}
                fileList={fileList}
                setFileList={setFileList}
              />
            </fieldset>
            {!user.isVerified && (
              <p>You must verify your email address to upload photos.</p>
            )}
            {!isPhotoUploadActive && (
              <Style>
                <div className="over-limit">
                  <Space direction="vertical">
                    <Text>
                      You must have an active membership to upload photos.
                    </Text>
                    <Button
                      type="primary"
                      href={`${process.env.ROOT_URL}/membership`}
                    >
                      Become a Daylily Catalog Member
                    </Button>
                  </Space>
                </div>
              </Style>
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

const Style = styled.div`
  .over-limit {
    margin: var(--spacing-sm) auto var(--spacing-lg);
    max-width: 400px;
    border: var(--hairline);
    padding: var(--spacing-sm);
    .ant-btn {
      height: var(--spacing-xl);
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
`;
