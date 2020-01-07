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
//import testImageUrl from "../util/testImageUrl";
// import ImgUp from "../components/imgUp";

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
  const [fileList, setFileList] = useState<any>([]);
  const [dataSource, setDataSource] = useState<Array<ILily>>([]);
  useEffect(() => {
    if (updateLily && updateLily.imgUrl) {
      setFileList(
        updateLily.imgUrl.map((url: any, i: number) => {
          return { uid: -i, name: "i", status: "done", url };
        })
      );
    }
  }, [updateLily]);
  const validateFields: (
    fieldNames?: Array<string>,
    options?: ValidateFieldsOptions
  ) => Promise<FormValues> = useMemo(
    () => promisify((...args) => form.validateFields(...args)),
    [form]
  );
  const handleCancle = () => {
    setShow(false);
    setUpdateLily(null);
    form.resetFields();
    setFileList([]);
    setDataSource([]);
  };
  const handleSubmit = useCallback(
    async e => {
      e.preventDefault();
      try {
        setError(null);
        const values = await validateFields();
        const imgUrls = fileList.map((file: any) => {
          return file.url;
        });
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
        setUpdateLily(null);
        const messageText = updateLily ? "Daylily edited" : "Daylily added";
        message.success(messageText);
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
      updateLily,
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

  return (
    <Modal
      visible={show}
      title={updateLily ? "Edit Daylily" : "Add a new Daylily"}
      onOk={handleSubmit}
      style={{ top: 20 }}
      onCancel={handleCancle}
    >
      <Form onSubmit={handleSubmit}>
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
            />
          )}
        </Form.Item>
        <ImgUpload fileList={[fileList, setFileList]} />
        <Form.Item label="AHS ID" style={{ display: "none" }}>
          {getFieldDecorator("ahsId", {
            initialValue: updateLily ? updateLily.ahsId : "",
            rules: [
              {
                required: false,
                message: "Enter an AHS ID, if you'd like.",
              },
            ],
          })(<TextArea data-cy="settingslilies-input-ahsId" autoSize />)}
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
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={value => `${value}`.replace(/\$\s?|(,*)/g, "")}
              precision={2}
              data-cy="settingslilies-input-price"
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
          })(<TextArea data-cy="settingslilies-input-publicNote" autoSize />)}
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
