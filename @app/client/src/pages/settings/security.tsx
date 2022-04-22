import { ApolloError } from "@apollo/client";
import { ErrorAlert, PasswordStrength, SettingsLayout } from "@app/components";
import {
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
  extractError,
  getCodeFromError,
  getPasswordStrength,
  getPasswordSuggestions,
} from "@app/lib";
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
        const errcode = getCodeFromError(e);
        if (errcode === "WEAKP") {
          // form.setFields([
          //   {
          //     name: "newPassword",
          //     value: form.getFieldValue("newPassword"),
          //     errors: [
          //       "The server believes this passphrase is too weak, please make it stronger",
          //     ],
          //   },
          // ]);
        } else if (errcode === "CREDS") {
          // form.setFields([
          //   {
          //     name: "oldPassword",
          //     value: form.getFieldValue("oldPassword"),
          //     errors: ["Incorrect old passphrase"],
          //   },
          // ]);
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
        <div>
          <Heading level={2}>Change passphrase</Heading>
          <p>
            You registered your account through social login, so you do not
            currently have a passphrase. If you would like a passphrase, press
            the button below to request a passphrase reset email to '{email}'
            (you can choose a different email by making it primary in{" "}
            <Link href="/settings/emails">email settings</Link>).
          </p>
          <Button onClick={handleResetPassword} disabled={resetInProgress}>
            Reset passphrase
          </Button>
        </div>
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
            <Button>Change Passphrase</Button>
          </SubmitButton>
        </Form>
      </FormWrapper>
    );
  };
  return (
    <SettingsLayout href="/settings/security" query={query}>
      {inner()}
    </SettingsLayout>
  );
};

export default Settings_Security;
