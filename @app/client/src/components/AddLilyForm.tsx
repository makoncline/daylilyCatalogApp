import React, { useCallback, useMemo } from "react";
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
const { TextArea } = Input;
interface FormValues {
  name: string;
  imgUrl: string;
  price: number;
  publicNote: string;
  privateNote: string;
}

interface AddLilyFormProps extends FormComponentProps<FormValues> {
  onComplete: () => void;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
  show: boolean;
  setShow: (val: boolean) => void;
  updateLily?: Lily | null;
  setUpdateLily: (val: any) => void;
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
}: AddLilyFormProps) {
  const [addLily] = useAddLilyMutation();
  const [editLily] = useEditLilyMutation();
  const [deleteLily] = useDeleteLilyMutation();
  const validateFields: (
    fieldNames?: Array<string>,
    options?: ValidateFieldsOptions
  ) => Promise<FormValues> = useMemo(
    () => promisify((...args) => form.validateFields(...args)),
    [form]
  );
  const handleSubmit = useCallback(
    async e => {
      e.preventDefault();
      try {
        setError(null);
        const values = await validateFields();
        if (updateLily) {
          await editLily({
            variables: {
              id: updateLily.id,
              imgUrl: values.imgUrl || null,
              name: values.name,
              price: values.price || null,
              publicNote: values.publicNote || null,
              privateNote: values.privateNote || null,
            },
          });
        } else {
          await addLily({
            variables: {
              imgUrl: values.imgUrl || null,
              name: values.name,
              price: values.price || null,
              publicNote: values.publicNote || null,
              privateNote: values.privateNote || null,
            },
          });
        }
        setUpdateLily(null);
        const messageText = updateLily ? "Daylily edited" : "Daylily added";
        message.success(messageText);
        form.resetFields();
        onComplete();
      } catch (e) {
        setError(e);
      }
    },
    [
      setError,
      validateFields,
      updateLily,
      setUpdateLily,
      form,
      onComplete,
      editLily,
      addLily,
    ]
  );

  function testImage(__: any, url: any, callback: any) {
    if (!url) callback();
    let timeout = 5000;
    let timedOut = false;
    let timer: any;
    let img = new Image();
    img.onerror = img.onabort = () => {
      if (!timedOut) {
        clearTimeout(timer);
        callback("Error: The URL entered may not be an image");
      }
    };
    img.onload = () => {
      if (!timedOut) {
        clearTimeout(timer);
        callback();
      }
    };
    img.src = url;
    timer = setTimeout(() => {
      timedOut = true;
      img.src = "//!!!!/test.jpg";
      callback("Error: The URL entered may not be an image");
    }, timeout);
  }

  const { getFieldDecorator } = form;
  const code = getCodeFromError(error);
  return (
    <Modal
      visible={show}
      title={updateLily ? "Edit Daylily" : "Add a new Daylily"}
      onOk={handleSubmit}
      onCancel={() => {
        setShow(false);
        setUpdateLily(null);
        form.resetFields();
      }}
    >
      <Form onSubmit={handleSubmit}>
        <Form.Item label="Name">
          {getFieldDecorator("name", {
            initialValue: updateLily ? updateLily.name : "",
            rules: [
              {
                required: true,
                message: "Please enter a daylily name",
              },
            ],
          })(<Input data-cy="settingslilies-input-name" />)}
        </Form.Item>
        <Form.Item label="Image URL">
          {getFieldDecorator("imgUrl", {
            initialValue: updateLily ? updateLily.imgUrl : "",
            rules: [
              {
                required: false,
                message: "Enter an image url, if you'd like.",
              },
              {
                validator: testImage,
              },
            ],
          })(<TextArea data-cy="settingslilies-input-imgUrl" autoSize />)}
        </Form.Item>
        <Form.Item label="Price">
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
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={value => `${value}`.replace(/\$\s?|(,*)/g, "")}
              precision={2}
              data-cy="settingslilies-input-price"
            />
          )}
        </Form.Item>
        <Form.Item label="Public note">
          {getFieldDecorator("publicNote", {
            initialValue: updateLily ? updateLily.publicNote : "",
            rules: [
              {
                required: false,
                message: "Enter a public note, if you'd like.",
              },
            ],
          })(<TextArea data-cy="settingslilies-input-publicNote" autoSize />)}
        </Form.Item>
        <Form.Item label="Private note">
          {getFieldDecorator("privateNote", {
            initialValue: updateLily ? updateLily.privateNote : "",
            rules: [
              {
                required: false,
                message: "Enter a private note, if you'd like.",
              },
            ],
          })(<TextArea data-cy="settingslilies-input-privateNote" autoSize />)}
        </Form.Item>

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
        {updateLily && (
          <Popconfirm
            title="Are you sure delete this daylily?"
            onConfirm={() => {
              deleteLily({ variables: { id: updateLily.id } });
              setShow(false);
              message.success("Daylily deleted");
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button type="danger">Delete</Button>
          </Popconfirm>
        )}
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
