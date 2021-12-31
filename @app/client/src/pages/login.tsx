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
  Error,
  Form,
  FormGroup,
  Input,
  Label,
  Space,
} from "@app/design";
import { useLoginMutation, useSharedQuery } from "@app/graphql";
import {
  extractError,
  getCodeFromError,
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
  error,
  setError,
  onCancel,
}: LoginFormProps) {
  const [state, setState] = React.useState<{
    values: { username: string; password: string };
    errors: { username?: string; password?: string };
  }>({
    values: {
      username: "",
      password: "",
    },
    errors: {},
  });

  const [submitDisabled, setSubmitDisabled] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const name = event.target.name;
    setState({
      ...state,
      values: {
        ...state.values,
        [name]: event.target.value,
      },
      errors: {},
    });
    setSubmitDisabled(hasError());
  }

  const [login] = useLoginMutation({});
  const client = useApolloClient();

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError(null);
      if (state.values.username.length === 0) {
        setState({
          ...state,
          errors: { ...state.errors, username: "Please input your username" },
        });
        console.log("no username");
        return;
      }
      if (state.values.password.length === 0) {
        setState({
          ...state,
          errors: { ...state.errors, password: "Please input your passphrase" },
        });
        console.log("no password");
        return;
      }
      try {
        await login({
          variables: {
            username: state.values.username,
            password: state.values.password,
          },
        });
        // Success: refetch
        resetWebsocketConnection();
        client.resetStore();
        Router.push(onSuccessRedirectTo);
      } catch (e: any) {
        const code = getCodeFromError(e);
        if (code === "CREDS") {
          setState({
            ...state,
            errors: {
              ...state.errors,
              password: "Incorrect username or passphrase",
            },
          });
          setSubmitDisabled(true);
        } else {
          setError(e);
        }
      }
    },
    [state, client, login, onSuccessRedirectTo, setError]
  );

  function hasError() {
    return Object.keys(state.errors).length !== 0;
  }

  const code = getCodeFromError(error);

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label htmlFor="username" hidden>
          Username
        </Label>
        <Input
          name="username"
          id="username"
          type="text"
          value={state.values.username}
          onChange={handleChange}
          placeholder="👤    E-mail or Username"
          autoComplete="email username"
          data-cy="loginpage-input-username"
        />
        {state.errors.username && <Error>{state.errors.username}</Error>}
      </FormGroup>
      <FormGroup>
        <Label htmlFor="password" hidden>
          Passphrase
        </Label>
        <Input
          name="password"
          id="password"
          type="password"
          value={state.values.password}
          onChange={handleChange}
          placeholder="🔒    Passphrase"
          autoComplete="current-password"
          data-cy="loginpage-input-password"
        />
        {state.errors.password && <Error>{state.errors.password}</Error>}
      </FormGroup>
      <FormGroup>
        <Link href="/forgot">
          <a>Forgotten passphrase?</a>
        </Link>
      </FormGroup>
      {error ? (
        <FormGroup>
          <Error>
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
          </Error>
        </FormGroup>
      ) : null}
      <FormGroup direction="row">
        <Button
          htmlType="submit"
          disabled={submitDisabled}
          data-cy="loginpage-button-submit"
        >
          Sign in
        </Button>
        <a style={{ marginLeft: 16 }} onClick={onCancel}>
          Use a different sign in method
        </a>
      </FormGroup>
    </Form>
  );
}
