import { ApolloError } from "@apollo/client";
import { ErrorAlert, PasswordStrength, SettingsLayout } from "@app/components";
import {
  Alert,
  Button,
  Field,
  Form,
  FormWrapper,
  Heading,
  OnChangeCallbackProps,
  SubmitButton,
} from "@app/design";
import {
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useSettingsPasswordQuery,
  useSharedQuery,
} from "@app/graphql";
import {
  emailsUrl,
  extractError,
  getCodeFromError,
  getPasswordStrength,
  getPasswordSuggestions,
  securityUrl,
} from "@app/lib";
import * as Sentry from "@sentry/nextjs";
import { NextPage } from "next";
import Link from "next/link";
import { Store } from "rc-field-form/lib/interface";
import React, { useCallback, useState } from "react";

const Settings_Security: NextPage = () => {
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordSuggestions, setPasswordSuggestions] = useState<string[]>([]);

  const query = useSharedQuery();

  const [changePassword] = useChangePasswordMutation();
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (values: Store) => {
      setSuccess(false);
      setError(null);
      try {
        await changePassword({
          variables: {
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
          },
        });
        setError(null);
        setSuccess(true);
      } catch (e: any) {
        Sentry.captureException(e);
        const errcode = getCodeFromError(e);
        if (errcode === "WEAKP") {
          setError(
            new Error(
              "The server believes this passphrase is too weak, please make it stronger"
            )
          );
        } else if (errcode === "CREDS") {
          setError(new Error("Incorrect old passphrase"));
        } else {
          setError(e);
        }
      }
    },
    [changePassword, setError]
  );

  const {
    data,
    error: graphqlQueryError,
    loading,
  } = useSettingsPasswordQuery();
  const [forgotPassword] = useForgotPasswordMutation();
  const u = data && data.currentUser;
  const userEmail = u && u.userEmails.nodes[0];
  const email = userEmail ? userEmail.email : null;
  const [resetInProgress, setResetInProgress] = useState(false);
  const [resetError, setResetError] = useState(null);
  const handleResetPassword = useCallback(() => {
    if (!email) return;
    if (resetInProgress) return;
    (async () => {
      setResetInProgress(true);
      try {
        await forgotPassword({ variables: { email } });
      } catch (e) {
        Sentry.captureException(e);
        setResetError(resetError);
      }
      setResetInProgress(false);
    })();
  }, [email, forgotPassword, resetError, resetInProgress]);

  const handleChange = ({ values, changedField }: OnChangeCallbackProps) => {
    if (changedField === "new-password") {
      const value = values[changedField];
      if (value.length > 0) {
        setPasswordStrength(getPasswordStrength(value));
        setPasswordSuggestions(getPasswordSuggestions(value));
      }
    }
  };

  const inner = () => {
    if (loading) {
      /* noop */
    } else if (graphqlQueryError) {
      return <ErrorAlert error={graphqlQueryError} />;
    } else if (data && data.currentUser && !data.currentUser.hasPassword) {
      return (
        <Alert type="info">
          <Alert.Heading>Change passphrase</Alert.Heading>
          <Alert.Body>
            <p>
              You registered your account through social login, so you do not
              currently have a passphrase. If you would like a passphrase, press
              the button below to request a passphrase reset email to '{email}'
              (you can choose a different email by making it primary in{" "}
              <Link href={emailsUrl}>email settings</Link>).
            </p>
          </Alert.Body>
          <Alert.Actions>
            <Button
              onClick={handleResetPassword}
              disabled={resetInProgress}
              block
            >
              Reset passphrase
            </Button>
          </Alert.Actions>
        </Alert>
      );
    }

    const code = getCodeFromError(error);
    const securityFormName = "security";
    return (
      <FormWrapper>
        <Heading level={2}>Change passphrase</Heading>
        <Form
          formId={securityFormName}
          onSubmit={handleSubmit}
          onChange={handleChange}
        >
          <Field name="old-password" required>
            Old passphrase
          </Field>
          <Field name="new-password">New passphrase</Field>
          <PasswordStrength
            passwordStrength={passwordStrength}
            suggestions={passwordSuggestions}
          />
          {error ? (
            <div>
              <p>Changing passphrase failed</p>
              <span>
                {extractError(error).message}
                {code ? (
                  <span>
                    {" "}
                    (Error code: <code>ERR_{code}</code>)
                  </span>
                ) : null}
              </span>
            </div>
          ) : success ? (
            <p>Password changed!</p>
          ) : null}
          <SubmitButton>
            <Button block>Change Passphrase</Button>
          </SubmitButton>
        </Form>
      </FormWrapper>
    );
  };
  return (
    <SettingsLayout href={securityUrl} query={query}>
      {inner()}
    </SettingsLayout>
  );
};

export default Settings_Security;
