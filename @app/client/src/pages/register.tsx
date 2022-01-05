import { ApolloError, useApolloClient } from "@apollo/client";
import {
  AuthRestrict,
  PasswordStrength,
  Redirect,
  SharedLayout,
} from "@app/components";
import {
  Button,
  Field,
  Form,
  FormContextProps,
  FormError,
  FormGroup,
  Input,
  Label,
  OnChangeCallbackProps,
  SubmitButton,
} from "@app/design";
import { useRegisterMutation, useSharedQuery } from "@app/graphql";
import {
  extractError,
  getCodeFromError,
  getExceptionFromError,
  resetWebsocketConnection,
  setPasswordInfo,
} from "@app/lib";
import { NextPage } from "next";
import Router from "next/router";
import React, { FocusEvent, useCallback, useState } from "react";

import { isSafe } from "./login";

interface RegisterProps {
  next: string | null;
}

/**
 * The registration page just renders the standard layout and embeds the
 * registration form.
 */
const Register: NextPage<RegisterProps> = ({ next: rawNext }) => {
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordSuggestions, setPasswordSuggestions] = useState<string[]>([]);
  const next: string = isSafe(rawNext) ? rawNext! : "/";
  const query = useSharedQuery();

  const [register] = useRegisterMutation({});
  const client = useApolloClient();
  const [confirmDirty, setConfirmDirty] = useState(false);

  const [state, setState] = React.useState<{
    values: {
      username: string;
      email: string;
      password: string;
      confirm: string;
      name: string;
    };
    errors: {
      username?: string;
      email?: string;
      password?: string;
      confirm?: string;
      name?: string;
    };
  }>({
    values: {
      username: "",
      email: "",
      password: "",
      confirm: "",
      name: "",
    },
    errors: {},
  });

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const { values, errors } = state;
      try {
        await register({
          variables: {
            username: values.username,
            email: values.email,
            password: values.password,
            name: values.name,
          },
        });
        // Success: refetch
        resetWebsocketConnection();
        client.resetStore();
        Router.push(next);
      } catch (e: any) {
        const code = getCodeFromError(e);
        const exception = getExceptionFromError(e);
        const fields: any = exception && exception["fields"];
        if (code === "WEAKP") {
          setState({
            ...state,
            errors: {
              ...errors,
              password:
                "The server believes this passphrase is too weak, please make it stronger",
            },
          });
        } else if (code === "EMTKN") {
          setState({
            ...state,
            errors: {
              ...errors,
              email:
                "An account with this email address has already been registered, consider using the 'Forgot passphrase' function.",
            },
          });
        } else if (code === "NUNIQ" && fields && fields[0] === "username") {
          setState({
            ...state,
            errors: {
              ...errors,
              username:
                "An account with this username has already been registered, please try a different username.",
            },
          });
        } else if (code === "23514") {
          setState({
            ...state,
            errors: {
              ...errors,
              username:
                "This username is not allowed; usernames must be between 2 and 24 characters long (inclusive), must start with a letter, and must contain only alphanumeric characters and underscores.",
            },
          });
        } else {
          setError(e);
        }
      }
    },
    [state, register, client, next]
  );

  const handleConfirmBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setConfirmDirty(confirmDirty || !!value);
    },
    [setConfirmDirty, confirmDirty]
  );

  const [passwordIsFocussed, setPasswordIsFocussed] = useState(false);
  const [passwordIsDirty, setPasswordIsDirty] = useState(false);
  const setPasswordFocussed = useCallback(() => {
    setPasswordIsFocussed(true);
  }, [setPasswordIsFocussed]);

  const setPasswordNotFocussed = useCallback(() => {
    setPasswordIsFocussed(false);
  }, [setPasswordIsFocussed]);

  const handleChange = useCallback(
    ({
      errors,
      values,
      setErrors,
      changedField: name,
    }: OnChangeCallbackProps) => {
      const value = values[name];
      const { password, confirm } = values;
      console.log(values);
      setPasswordInfo(
        { setPasswordStrength, setPasswordSuggestions },
        { [name]: value }
      );
      if (name === "password") {
        setPasswordIsDirty(true);
        if (confirm.length > 0) {
          setErrors({
            ...errors,
            confirm: validateConfirm(confirm, password),
          });
        }
      }
      if (name === "confirm") {
        setErrors({
          ...errors,
          confirm: validateConfirm(confirm, password),
        });
      }
    },
    []
  );

  const code = getCodeFromError(error);
  return (
    <SharedLayout
      title="Register"
      query={query}
      forbidWhen={AuthRestrict.LOGGED_IN}
    >
      {({ currentUser }) =>
        currentUser ? (
          <Redirect href={next} />
        ) : (
          <Form
            onChange={handleChange}
            onSubmit={handleSubmit}
            validation={{
              username: validateUsername,
              email: validateEmail,
              confirm: validateConfirm,
            }}
          >
            <Field
              placeholder="What is your name?"
              autoComplete="name"
              data-cy="registerpage-input-name"
            >
              Name
            </Field>
            <Field
              placeholder="What would you like people to call you?"
              autoComplete="username"
              data-cy="registerpage-input-username"
            >
              Username
            </Field>
            <Field
              placeholder="What is your email address?"
              autoComplete="email"
              data-cy="registerpage-input-email"
            >
              Email
            </Field>
            <FormGroup>
              <Field
                name="password"
                placeholder="Enter a secure passphrase."
                autoComplete="current-password"
                type="password"
                data-cy="loginpage-input-password"
              >
                Passphrase
              </Field>
              <PasswordStrength
                passwordStrength={passwordStrength}
                suggestions={passwordSuggestions}
                isDirty={passwordIsDirty}
                isFocussed={passwordIsFocussed}
              />
            </FormGroup>
            <Field
              name="confirm"
              placeholder="Confirm your passphrase."
              autoComplete="new-password"
              type="password"
              data-cy="registerpage-input-password2"
            >
              Confirm Passphrase
            </Field>
            {error ? (
              <FormGroup>
                <FormError>
                  <p>Registration failed</p>
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
            <SubmitButton>
              <Button data-cy="registerpage-submit-button">Register</Button>
            </SubmitButton>
          </Form>
        )
      }
    </SharedLayout>
  );
};

export default Register;

const validateConfirm = (confirm: string, password: string) => {
  if (confirm && confirm !== password) {
    return "Make sure your passphrase is the same in both passphrase boxes.";
  } else {
    return null;
  }
};
const validateUsername = (username: string) => {
  if (username.length < 2) {
    return "Username must be at least 2 characters long.";
  } else if (username.length > 24) {
    return "Username must be no more than 24 characters long.";
  } else if (!/^([a-zA-Z]|$)/.test(username)) {
    return "Username must start with a letter.";
  } else if (!/^([^_]|_[^_]|_$)*$/.test(username)) {
    return "Username must not contain two underscores next to each other.";
  } else if (!/^[a-zA-Z0-9_]*$/.test(username)) {
    return "Username must contain only alphanumeric characters and underscores.";
  } else {
    return null;
  }
};

const validateEmail = (email: string) => {
  if (
    !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    )
  ) {
    return "Please enter a valid email address.";
  } else {
    return null;
  }
};
