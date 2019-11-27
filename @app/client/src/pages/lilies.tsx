import React, { useState, useCallback, useMemo } from "react";
import { promisify } from "util";
import SettingsLayout from "../components/SettingsLayout";
import {
  useSettingsLiliesQuery,
  useAddLilyMutation,
  LiliesForm_UserLilyFragment,
  useResendLilyVerificationMutation,
  useMakeLilyPrimaryMutation,
  useDeleteLilyMutation,
} from "@app/graphql";
import { Alert, List, Avatar, Form, Input, Button } from "antd";
import { FormComponentProps, ValidateFieldsOptions } from "antd/lib/form/Form";
import { ApolloError } from "apollo-client";
import Redirect from "../components/Redirect";
import { getCodeFromError, extractError } from "../errors";
import Error from "../components/ErrorAlert";
import { H3, P } from "../components/Text";

function Lily({
  lily,
  hasOtherLilies,
}: {
  lily: LiliesForm_UserLilyFragment;
  hasOtherLilies: boolean;
}) {
  const canDelete = !lily.isPrimary && hasOtherLilies;
  const [deleteLily] = useDeleteLilyMutation();
  const [resendLilyVerification] = useResendLilyVerificationMutation();
  const [makeLilyPrimary] = useMakeLilyPrimaryMutation();
  return (
    <List.Item
      data-cy={`settingslilies-lilyitem-${lily.lily.replace(
        /[^a-zA-Z0-9]/g,
        "-"
      )}`}
      key={lily.id}
      actions={[
        lily.isPrimary && (
          <span data-cy="settingslilies-indicator-primary">Primary</span>
        ),
        canDelete && (
          <a
            onClick={() => deleteLily({ variables: { lilyId: lily.id } })}
            data-cy="settingslilies-button-delete"
          >
            Delete
          </a>
        ),
        !lily.isVerified && (
          <a
            onClick={() =>
              resendLilyVerification({ variables: { lilyId: lily.id } })
            }
          >
            Resend verification
          </a>
        ),
        lily.isVerified && !lily.isPrimary && (
          <a
            onClick={() => makeLilyPrimary({ variables: { lilyId: lily.id } })}
            data-cy="settingslilies-button-makeprimary"
          >
            Make primary
          </a>
        ),
      ].filter(_ => _)}
    >
      <List.Item.Meta
        avatar={
          <Avatar size="large" style={{ backgroundColor: "transparent" }}>
            ✉️
          </Avatar>
        }
        title={
          <span>
            {" "}
            {lily.lily}{" "}
            <span
              title={
                lily.isVerified
                  ? "Verified"
                  : "Pending verification (please check your inbox / spam folder"
              }
            >
              {" "}
              {lily.isVerified ? (
                "✅"
              ) : (
                <small style={{ color: "red" }}>(unverified)</small>
              )}{" "}
            </span>{" "}
          </span>
        }
        description={`Added ${new Date(
          Date.parse(lily.createdAt)
        ).toLocaleString()}`}
      />
    </List.Item>
  );
}

export default function Settings_Lilies() {
  const [showAddLilyForm, setShowAddLilyForm] = useState(false);
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);
  const { data, loading, error } = useSettingsLiliesQuery();
  const user = data && data.currentUser;
  const pageContent = (() => {
    if (error && !loading) {
      return <Error error={error} />;
    } else if (!user && !loading) {
      return (
        <Redirect
          href={`/login?next=${encodeURIComponent("/settings/lilies")}`}
        />
      );
    } else if (!user) {
      return "Loading";
    } else {
      return (
        <div>
          {user.isVerified ? null : (
            <div style={{ marginBottom: "0.5rem" }}>
              <Alert
                type="warning"
                showIcon
                message="No verified lilies"
                description={`
                  You do not have any verified lily addresses, this will make
                  account recovery impossible and may limit your available
                  functionality within this application. Please complete lily
                  verification.
                `}
              />
            </div>
          )}
          <H3>Your Daylily Catalog</H3>
          <P>View, add, edit, and delete daylilies from your catalog here.</P>
          <List
            dataSource={user.userLilies.nodes}
            renderItem={lily => <Lily lily={lily} />}
          />
          {!showAddLilyForm ? (
            <div>
              <Button
                type="primary"
                onClick={() => setShowAddLilyForm(true)}
                data-cy="settingslilies-button-addlily"
              >
                Add lily
              </Button>
            </div>
          ) : (
            <WrappedAddLilyForm
              onComplete={() => setShowAddLilyForm(false)}
              error={formError}
              setError={setFormError}
            />
          )}
        </div>
      );
    }
  })();
  return <SettingsLayout href="/lilies">{pageContent}</SettingsLayout>;
}

interface FormValues {
  lily: string;
}

interface AddLilyFormProps extends FormComponentProps<FormValues> {
  onComplete: () => void;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
}

function AddLilyForm({ form, error, setError, onComplete }: AddLilyFormProps) {
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
        await addLily({ variables: { lily: values.lily } });
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
    <Form onSubmit={handleSubmit}>
      <Form.Item label="New daylily">
        {getFieldDecorator("lily", {
          initialValue: "",
          rules: [
            {
              required: true,
              message: "Please enter a daylily name",
            },
          ],
        })(<Input data-cy="settingslilies-input-lily" />)}
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
      <Form.Item>
        <Button htmlType="submit" data-cy="settingslilies-button-submit">
          Add daylily
        </Button>
      </Form.Item>
    </Form>
  );
}

const WrappedAddLilyForm = Form.create<AddLilyFormProps>({
  name: "addLilyForm",
  onValuesChange(props) {
    props.setError(null);
  },
})(AddLilyForm);
