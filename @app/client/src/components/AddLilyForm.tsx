import React, { useCallback, useMemo } from "react";
import { useAddLilyMutation } from "@app/graphql";
import { Alert, Form, Input, Modal } from "antd";
import { promisify } from "util";
import { FormComponentProps, ValidateFieldsOptions } from "antd/lib/form/Form";
import { ApolloError } from "apollo-client";
import { getCodeFromError, extractError } from "../errors";

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
}

function AddLilyForm({
  form,
  error,
  setError,
  onComplete,
  show,
  setShow,
}: AddLilyFormProps) {
  const [addLily] = useAddLilyMutation();
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
        await addLily({
          variables: {
            imgUrl: values.imgUrl || null,
            name: values.name,
            price: values.price || null,
            publicNote: values.publicNote || null,
            privateNote: values.privateNote || null,
          },
        });
        onComplete();
      } catch (e) {
        setError(e);
      }
    },
    [addLily, onComplete, setError, validateFields]
  );
  const { getFieldDecorator } = form;
  const code = getCodeFromError(error);
  return (
    <Modal
      visible={show}
      title="Add a new Daylily"
      onOk={handleSubmit}
      onCancel={() => setShow(false)}
    >
      <Form onSubmit={handleSubmit}>
        <Form.Item label="Name">
          {getFieldDecorator("name", {
            initialValue: "",
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
            initialValue: "",
            rules: [
              {
                required: false,
                message: "Enter an image url, if you'd like.",
              },
            ],
          })(<Input data-cy="settingslilies-input-imgUrl" />)}
        </Form.Item>
        <Form.Item label="Price">
          {getFieldDecorator("price", {
            initialValue: "",
            rules: [
              {
                required: false,
                message: "Enter a price, if you'd like.",
              },
            ],
          })(<Input data-cy="settingslilies-input-price" />)}
        </Form.Item>
        <Form.Item label="Public note">
          {getFieldDecorator("publicNote", {
            initialValue: "",
            rules: [
              {
                required: false,
                message: "Enter a public note, if you'd like.",
              },
            ],
          })(<Input data-cy="settingslilies-input-publicNote" />)}
        </Form.Item>
        <Form.Item label="Private note">
          {getFieldDecorator("privateNote", {
            initialValue: "",
            rules: [
              {
                required: false,
                message: "Enter a private note, if you'd like.",
              },
            ],
          })(<Input data-cy="settingslilies-input-privateNote" />)}
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
