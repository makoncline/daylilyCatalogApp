import { ApolloError, useApolloClient } from "@apollo/client";
import {
  AuthRestrict,
  Link,
  Redirect,
  SharedLayout,
  SharedLayoutChildProps,
} from "@app/components";
import {
  Button,
  Field,
  Form,
  FormError,
  FormGroup,
  FormStateContextProps,
  FormWrapper,
  Space,
  SubmitButton,
} from "@app/design";
import { useLoginMutation, useSharedQuery } from "@app/graphql";
import {
  extractError,
  forgotUrl,
  getCodeFromError,
  registerUrl,
  resetWebsocketConnection,
} from "@app/lib";
import { NextPage } from "next";
import Router from "next/router";
import React, { useCallback, useState } from "react";

interface LoginProps {
  next: string | null;
}

export function isSafe(nextUrl: string | null) {
  return (nextUrl && nextUrl[0] === "/") || false;
}

const Login: NextPage<LoginProps> = ({ next: rawNext }) => {
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const next: string = isSafe(rawNext) ? rawNext! : "/";
  const query = useSharedQuery();
  return (
    <SharedLayout
      title="Sign in"
      query={query}
      forbidWhen={AuthRestrict.LOGGED_IN}
    >
      {({ currentUser }: SharedLayoutChildProps) =>
        currentUser ? (
          <Redirect href={next} />
        ) : (
          <FormWrapper>
            {showLogin ? (
              <LoginForm
                onSuccessRedirectTo={next}
                onCancel={() => setShowLogin(false)}
                error={error}
                setError={setError}
              />
            ) : (
              <Space direction="column">
                <Button
                  data-cy="loginpage-button-withusername"
                  onClick={() => setShowLogin(true)}
                >
                  Sign in with E-mail or Username
                </Button>
                <Button
                  href={`${registerUrl}?next=${encodeURIComponent(next)}`}
                  block
                >
                  Create an account
                </Button>
              </Space>
            )}
          </FormWrapper>
        )
      }
    </SharedLayout>
  );
};

Login.getInitialProps = async ({ query }) => ({
  next: typeof query.next === "string" ? query.next : null,
});

export default Login;

interface LoginFormProps {
  onSuccessRedirectTo: string;
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
  onCancel: () => void;
}

function LoginForm({
  onSuccessRedirectTo,
  error,
  setError,
  onCancel,
}: LoginFormProps) {
  const [login] = useLoginMutation({});
  const client = useApolloClient();

  const handleSubmit = useCallback(
    async ({ values, errors, setErrors }: FormStateContextProps) => {
      setError(null);
      try {
        await login({
          variables: {
            username: values.username,
            password: values.password,
          },
        });
        // Success: refetch
        resetWebsocketConnection();
        client.resetStore();
        Router.push(onSuccessRedirectTo);
      } catch (e: any) {
        const code = getCodeFromError(e);
        if (code === "CREDS") {
          setErrors({
            ...errors,
            password: "Incorrect username or passphrase",
          });
        } else {
          setError(e);
        }
      }
    },
    [client, login, onSuccessRedirectTo, setError]
  );

  const code = getCodeFromError(error);

  return (
    <Form
      formId="login"
      onSubmit={handleSubmit}
      validation={{
        username: (username) =>
          username?.length === 0 ? "Please input your username" : null,
        password: (password) =>
          password?.length === 0 ? "Please input your passphrase" : null,
      }}
    >
      <Field
        placeholder="👤    E-mail or Username"
        autoComplete="email username"
        data-cy="loginpage-input-username"
      >
        Username
      </Field>
      <Field
        name="password"
        placeholder="🔒    Passphrase"
        autoComplete="current-password"
        data-cy="loginpage-input-password"
      >
        Passphrase
      </Field>
      <FormGroup>
        <Link href={forgotUrl}>
          <a>Forgotten passphrase?</a>
        </Link>
      </FormGroup>
      {error ? (
        <FormGroup>
          <FormError>
            <p>Sign in failed</p>
            <span>
              {extractError(error).message}
              {code ? (
                <span>
                  {" "}
                  (Error code: <code>ERR_{code}</code>)
                </span>
              ) : null}
            </span>
          </FormError>
        </FormGroup>
      ) : null}
      <FormGroup direction="row">
        <SubmitButton>
          <Button data-cy="loginpage-button-submit">Sign in</Button>
        </SubmitButton>
        <a style={{ marginLeft: 16 }} onClick={onCancel}>
          Use a different sign in method
        </a>
      </FormGroup>
    </Form>
  );
}
