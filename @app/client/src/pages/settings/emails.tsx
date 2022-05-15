import { ApolloError } from "@apollo/client";
import { ErrorAlert, Redirect, SettingsLayout } from "@app/components";
import {
  Alert,
  Button,
  Field,
  Form,
  FormStateContextProps,
  Heading,
  Space,
  SubmitButton,
} from "@app/design";
import {
  EmailsForm_UserEmailFragment,
  useAddEmailMutation,
  useDeleteEmailMutation,
  useMakeEmailPrimaryMutation,
  useResendEmailVerificationMutation,
  useSettingsEmailsQuery,
} from "@app/graphql";
import { emailsUrl, extractError, getCodeFromError } from "@app/lib";
import { NextPage } from "next";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

function Email({
  email,
  hasOtherEmails,
}: {
  email: EmailsForm_UserEmailFragment;
  hasOtherEmails: boolean;
}) {
  const canDelete = !email.isPrimary && hasOtherEmails;
  const [deleteEmail] = useDeleteEmailMutation();
  const [resendEmailVerification] = useResendEmailVerificationMutation();
  const [makeEmailPrimary] = useMakeEmailPrimaryMutation();
  return (
    <StyledEmail
      data-cy={`settingsemails-emailitem-${email.email.replace(
        /[^a-zA-Z0-9]/g,
        "-"
      )}`}
    >
      <Space center gap="large">
        ✉️
        <Space direction="column">
          <Space gap="large">
            {email.email}
            <span
              title={
                email.isVerified
                  ? "Verified"
                  : "Pending verification (please check your inbox / spam folder"
              }
            >
              {email.isVerified ? (
                "✅"
              ) : (
                <small style={{ color: "var(--danger)" }}>(unverified)</small>
              )}
            </span>
          </Space>
          {`Added ${new Date(Date.parse(email.createdAt)).toLocaleString()}`}
        </Space>
      </Space>
      <Space>
        {[
          email.isPrimary && (
            <span data-cy="settingsemails-indicator-primary">Primary</span>
          ),
          canDelete && (
            <Button
              onClick={() => deleteEmail({ variables: { emailId: email.id } })}
              data-cy="settingsemails-button-delete"
            >
              Delete
            </Button>
          ),
          !email.isVerified && (
            <Button
              onClick={() =>
                resendEmailVerification({ variables: { emailId: email.id } })
              }
            >
              Resend verification
            </Button>
          ),
          email.isVerified && !email.isPrimary && (
            <Button
              onClick={() =>
                makeEmailPrimary({ variables: { emailId: email.id } })
              }
              data-cy="settingsemails-button-makeprimary"
            >
              Make primary
            </Button>
          ),
        ].filter((_) => _)}
      </Space>
    </StyledEmail>
  );
}

const Settings_Emails: NextPage = () => {
  const [showAddEmailForm, setShowAddEmailForm] = useState(false);
  const [formError, setFormError] = useState<Error | ApolloError | null>(null);
  const query = useSettingsEmailsQuery();
  const { data, loading, error } = query;
  const user = data && data.currentUser;
  const pageContent = (() => {
    if (error && !loading) {
      return <ErrorAlert error={error} />;
    } else if (!user && !loading) {
      return (
        <Redirect
          href={`/login?next=${encodeURIComponent("/settings/emails")}`}
        />
      );
    } else if (!user) {
      return "Loading";
    } else {
      return (
        <Space direction="column" gap="large">
          {user.isVerified ? null : (
            <Alert type="danger">
              <Alert.Heading>No verified emails</Alert.Heading>
              <Alert.Body>
                <p>
                  You do not have any verified email addresses, this will make
                  account recovery impossible and may limit your available
                  functionality within this application. Please complete email
                  verification.
                </p>
              </Alert.Body>
            </Alert>
          )}
          <div>
            <Heading level={2}>Email addresses</Heading>
            <p>
              <strong>
                Account notices will be sent your primary email address.
              </strong>
              Additional email addresses may be added to help with account
              recovery (or to change your primary email), but they cannot be
              used until verified.
            </p>
          </div>
          <div>
            <EmailList>
              {user.userEmails.nodes.map((email, index) => (
                <Email
                  email={email}
                  key={index}
                  hasOtherEmails={user.userEmails.nodes.length > 1}
                />
              ))}
            </EmailList>
          </div>
          {!showAddEmailForm ? (
            <div>
              <Button
                styleType="primary"
                onClick={() => setShowAddEmailForm(true)}
                data-cy="settingsemails-button-addemail"
              >
                Add email
              </Button>
            </div>
          ) : (
            <AddEmailForm
              onComplete={() => setShowAddEmailForm(false)}
              error={formError}
              setError={setFormError}
            />
          )}
        </Space>
      );
    }
  })();
  return (
    <SettingsLayout href={emailsUrl} query={query}>
      {pageContent}
    </SettingsLayout>
  );
};

export default Settings_Emails;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface FormValues {
  email: string;
}

interface AddEmailFormProps {
  onComplete: () => void;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
}

function AddEmailForm({ error, setError, onComplete }: AddEmailFormProps) {
  const [addEmail] = useAddEmailMutation();
  const handleSubmit = useCallback(
    async ({ values }: FormStateContextProps) => {
      try {
        setError(null);
        await addEmail({ variables: { email: values.email } });
        onComplete();
      } catch (e: any) {
        setError(e);
      }
    },
    [addEmail, onComplete, setError]
  );
  const code = getCodeFromError(error);
  const newEmailForm = "new-email";
  return (
    <Form formId={newEmailForm} onSubmit={handleSubmit}>
      <Field name="email" required data-cy="settingsemails-input-email">
        New email
      </Field>
      {error ? (
        <Alert type="danger">
          <Alert.Heading>Error adding email</Alert.Heading>
          <Alert.Body>
            <span>
              {extractError(error).message}
              {code ? (
                <span>
                  {" "}
                  (Error code: <code>ERR_{code}</code>)
                </span>
              ) : null}
            </span>
          </Alert.Body>
        </Alert>
      ) : null}
      <SubmitButton>
        <Button data-cy="settingsemails-button-submit">Add email</Button>
      </SubmitButton>
    </Form>
  );
}

const StyledEmail = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--size-2);
`;

const EmailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  & > :not(:last-child) {
    border-bottom: var(--hairline);
  }
`;
