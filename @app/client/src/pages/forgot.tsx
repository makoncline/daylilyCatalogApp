import { ApolloError } from "@apollo/client";
import { AuthRestrict, SharedLayout } from "@app/components";
import {
  Alert,
  Button,
  Field,
  Form,
  FormWrapper,
  SubmitButton,
  useForm,
} from "@app/design";
import { useForgotPasswordMutation, useSharedQuery } from "@app/graphql";
import { extractError, getCodeFromError, loginUrl } from "@app/lib";
import { NextPage } from "next";
import Link from "next/link";
import React, { useCallback, useState } from "react";

import { validateEmail } from "../util";

const ForgotPassword: NextPage = () => {
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const query = useSharedQuery();
  const forgotPasswordFormName = "forgot-password";
  const { values } = useForm(forgotPasswordFormName);
  const [forgotPassword] = useForgotPasswordMutation();
  const [successfulEmail, setSuccessfulEmail] = useState<string | null>(null);

  const handleSubmit = useCallback((): void => {
    setError(null);
    (async () => {
      try {
        const email = values.email;
        await forgotPassword({
          variables: {
            email,
          },
        });
        // Success: refetch
        setSuccessfulEmail(email);
      } catch (e: any) {
        setError(e);
      }
    })();
  }, [forgotPassword, values]);

  const code = getCodeFromError(error);

  if (successfulEmail != null) {
    return (
      <SharedLayout title="Forgot Password" query={query}>
        <Alert type="success">
          <Alert.Heading>You've got mail</Alert.Heading>
          <Alert.Body>
            {`We've sent an email reset link to '${successfulEmail}'; click the link and follow the instructions. If you don't receive the link, please ensure you entered the email address correctly, and check in your spam folder just in case.`}
          </Alert.Body>
        </Alert>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout
      title="Forgot Password"
      query={query}
      forbidWhen={AuthRestrict.LOGGED_IN}
    >
      <FormWrapper>
        <Form
          formId={forgotPasswordFormName}
          onSubmit={handleSubmit}
          validation={{ email: validateEmail }}
        >
          <Field>Email</Field>
          {error ? (
            <Alert type="danger">
              <Alert.Heading>Something went wrong</Alert.Heading>
              <Alert.Body>
                {" "}
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
            <Button type="primary" htmlType="submit">
              Reset password
            </Button>
          </SubmitButton>
          <p>
            <Link href={loginUrl}>
              <a>Remembered your password? Log in.</a>
            </Link>
          </p>
        </Form>
      </FormWrapper>
    </SharedLayout>
  );
};

export default ForgotPassword;
