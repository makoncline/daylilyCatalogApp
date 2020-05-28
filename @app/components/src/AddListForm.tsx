import { QuestionCircleOutlined } from "@ant-design/icons";
import {
  List,
  useAddListMutation,
  useDeleteListMutation,
  useUpdateListMutation,
} from "@app/graphql";
import { extractError, formItemLayout, getCodeFromError } from "@app/lib";
import {
  Alert,
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Tooltip,
} from "antd";
import TextArea from "antd/lib/input/TextArea";
import { ApolloError } from "apollo-client";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

export const AddListForm = ({
  show,
  setShow,
  updateList,
  setUpdateList,
}: {
  show: boolean | undefined;
  setShow: Dispatch<SetStateAction<boolean>>;
  updateList: List | null;
  setUpdateList: Dispatch<SetStateAction<List | null>>;
}) => {
  const [addList] = useAddListMutation();
  const [editList] = useUpdateListMutation();
  const [deleteList] = useDeleteListMutation();
  const [form] = Form.useForm();
  const focusElement = useRef(null);
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);

  useEffect(() => {
    form.resetFields();
  }, [form, updateList]);
  const handleCancel = () => {
    resetForm();
  };
  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      setFormError(null);
      if (updateList) {
        await editList({
          variables: {
            id: updateList.id,
            patch: {
              name: values.listName,
              intro: values.listDescription,
            },
          },
        });
      } else {
        await addList({
          variables: {
            name: values.listName,
            intro: values.listDescription,
          },
        });
      }
      const messageText = updateList ? "List edited" : "List added";
      message.success(messageText);
      resetForm();
    } catch (e) {
      setFormError(e);
    }
  };
  const handleDelete = async (id: any) => {
    deleteList({ variables: { id } });
    resetForm();
    handleCancel();
    message.success("List deleted");
  };

  const resetForm = () => {
    setUpdateList(null);
    form.resetFields();
    setShow(false);
  };

  return (
    <Modal
      forceRender
      visible={show}
      title={updateList ? "Edit List" : "Add a new List"}
      onOk={handleSubmit}
      style={{ top: 20 }}
      onCancel={handleCancel}
      footer={
        updateList
          ? [
              <Popconfirm
                key={1}
                title="Are you sure delete this list? The daylilies on the list will not be deleted."
                onConfirm={() => handleDelete(updateList.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="primary" danger style={{ float: "left" }}>
                  Delete
                </Button>
              </Popconfirm>,
              <Button key={2} onClick={handleCancel}>
                Cancel
              </Button>,
              <Button key={3} type="primary" onClick={handleSubmit}>
                SAVE
              </Button>,
            ]
          : [
              <Button key={1} onClick={handleCancel}>
                Cancel
              </Button>,
              <Button key={2} type="primary" onClick={handleSubmit}>
                Save
              </Button>,
            ]
      }
    >
      <Form
        {...formItemLayout}
        form={form}
        onFinish={handleSubmit}
        initialValues={
          updateList
            ? { listName: updateList.name, listDescription: updateList.intro }
            : {}
        }
      >
        <Form.Item
          label={
            <span>
              Name&nbsp;
              <Tooltip title="Enter a name for this list.">
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          name="listName"
        >
          <Input ref={focusElement} />
        </Form.Item>
        <Form.Item
          label={
            <span>
              Description&nbsp;
              <Tooltip title="Enter a description for this list">
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          name="listDescription"
        >
          <TextArea autoSize={{ minRows: 2 }} />
        </Form.Item>
        {formError ? (
          <Form.Item label="Error">
            <Alert
              type="error"
              message={`Saving list failed`}
              description={
                <span>
                  {extractError(formError).message}
                  {getCodeFromError(formError) ? (
                    <span>
                      {" "}
                      (Error code:{" "}
                      <code>ERR_{getCodeFromError(formError)}</code>)
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
