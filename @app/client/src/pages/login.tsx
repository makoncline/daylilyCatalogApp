import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { ApolloError, useApolloClient } from "@apollo/client";
import {
  AuthRestrict,
  Redirect,
  SharedLayout,
  SharedLayoutChildProps,
} from "@app/components";
import { Button, Space } from "@app/design";
import { useLoginMutation, useSharedQuery } from "@app/graphql";
import {
  extractError,
  getCodeFromError,
  resetWebsocketConnection,
} from "@app/lib";
import { Alert, Form, Input } from "antd";
import { useForm } from "antd/lib/form/Form";
import { NextPage } from "next";
import Link from "next/link";
import Router from "next/router";
import { Store } from "rc-field-form/lib/interface";
import React, { useCallback, useEffect, useRef, useState } from "react";

function hasErrors(fieldsError: Object) {
  return Object.keys(fieldsError).some((field) => fieldsError[field]);
}

interface LoginProps {
  next: string | null;
}

export function isSafe(nextUrl: string | null) {
  return (nextUrl && nextUrl[0] === "/") || false;
}

/**
 * Login page just renders the standard layout and embeds the login form
 */
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
          <>
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
                  href={`/register?next=${encodeURIComponent(next)}`}
                  block
                >
                  Create an account
                </Button>
              </Space>
            )}
          </>
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
  onCancel,
  error,
  setError,
}: LoginFormProps) {
  const [form] = useForm();
  const [login] = useLoginMutation({});
  const client = useApolloClient();

  const [submitDisabled, setSubmitDisabled] = useState(false);
  const handleSubmit = useCallback(
    async (values: Store) => {
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
      } catch (e) {
        const code = getCodeFromError(e);
        if (code === "CREDS") {
          form.setFields([
            {
              name: "password",
              value: form.getFieldValue("password"),
              errors: ["Incorrect username or passphrase"],
            },
          ]);
          setSubmitDisabled(true);
        } else {
          setError(e);
        }
      }
    },
    [client, form, login, onSuccessRedirectTo, setError]
  );

  const focusElement = useRef<Input>(null);
  useEffect(
    () => void (focusElement.current && focusElement.current!.focus()),
    [focusElement]
  );

  const handleValuesChange = useCallback(() => {
    setSubmitDisabled(hasErrors(form.getFieldsError().length !== 0));
  }, [form]);

  const code = getCodeFromError(error);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      onValuesChange={handleValuesChange}
      style={{ width: "100%" }}
    >
      <Form.Item
        name="username"
        rules={[{ required: true, message: "Please input your username" }]}
      >
        <Input
          size="large"
          prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
          placeholder="E-mail or Username"
          autoComplete="email username"
          ref={focusElement}
          data-cy="loginpage-input-username"
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: "Please input your passphrase" }]}
      >
        <Input
          prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
          size="large"
          type="password"
          placeholder="Passphrase"
          autoComplete="current-password"
          data-cy="loginpage-input-password"
        />
      </Form.Item>
      <Form.Item>
        <Link href="/forgot">
          <a>Forgotten passphrase?</a>
        </Link>
      </Form.Item>

      {error ? (
        <Form.Item>
          <Alert
            type="error"
            message={`Sign in failed`}
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
        <Button
          type="primary"
          htmlType="submit"
          disabled={submitDisabled}
          data-cy="loginpage-button-submit"
        >
          Sign in
        </Button>
        <a style={{ marginLeft: 16 }} onClick={onCancel}>
          Use a different sign in method
        </a>
      </Form.Item>
    </Form>
  );
}
