import {
  AuthRestrict,
  PasswordStrength,
  SEO,
  SharedLayout,
} from "@app/components";
import {
  Alert,
  Button,
  Field,
  Form,
  FormGroup,
  FormWrapper,
  OnChangeCallbackProps,
  SubmitButton,
  useForm,
} from "@app/design";
import { useResetPasswordMutation, useSharedQuery } from "@app/graphql";
import { setPasswordInfo } from "@app/lib";
import * as Sentry from "@sentry/nextjs";
import get from "lodash/get";
import { NextPage } from "next";
import React, { useCallback, useState } from "react";

import { validateConfirm } from "../util";

interface IProps {
  userId: number | null;
  token: string | null;
}

enum State {
  PENDING = "PENDING",
  SUBMITTING = "SUBMITTING",
  SUCCESS = "SUCCESS",
}

const ResetPage: NextPage<IProps> = ({
  userId: rawUserId,
  token: rawToken,
}) => {
  const [error, setError] = useState<Error | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordSuggestions, setPasswordSuggestions] = useState<string[]>([]);
  const [state, setState] = useState<State>(State.PENDING);
  const query = useSharedQuery();
  const resetPasswordFormName = "reset-password";
  const { values } = useForm(resetPasswordFormName);

  const [[userId, token], setIdAndToken] = useState<[number, string]>([
    rawUserId || 0,
    rawToken || "",
  ]);

  const [resetPassword] = useResetPasswordMutation();

  const handleSubmit = useCallback(() => {
    setState(State.SUBMITTING);
    setError(null);
    (async () => {
      try {
        const result = await resetPassword({
          variables: {
            userId,
            token,
            password: values.password,
          },
        });
        if (get(result, "data.resetPassword.success")) {
          setState(State.SUCCESS);
        } else {
          setState(State.PENDING);
          setError(new Error("Incorrect token, please check and try again"));
        }
      } catch (e: any) {
        if (e.message) {
          setError(e);
        } else {
          setError(new Error("Please check the errors above and try again"));
          console.dir(e);
        }
        Sentry.captureException(e);
        setState(State.PENDING);
      }
    })();
  }, [resetPassword, token, userId, values]);

  const handleChange = useCallback(
    ({
      errors,
      values,
      setErrors,
      changedField: name,
    }: OnChangeCallbackProps) => {
      const value = values[name];
      const { password, confirm } = values;
      setPasswordInfo(
        { setPasswordStrength, setPasswordSuggestions },
        { [name]: value }
      );
      if (name === "password") {
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

  return (
    <SharedLayout
      title="Reset Password"
      query={query}
      forbidWhen={
        // reset is used to change password of OAuth-authenticated users
        AuthRestrict.NEVER
      }
    >
      <SEO
        title="Reset Password"
        description="Create a new password for your Daylily Catalog account."
        noRobots
      />
      <FormWrapper>
        {state === "SUBMITTING" ? (
          <Alert type="info">
            <Alert.Heading>Submitting...</Alert.Heading>
            <Alert.Body>This might take a few moments...</Alert.Body>
          </Alert>
        ) : state === "SUCCESS" ? (
          <Alert type="success">
            <Alert.Heading>Password Reset</Alert.Heading>
            <Alert.Body>
              Your password was reset; you can go and log in now
            </Alert.Body>
          </Alert>
        ) : null}
        <Form
          formId={resetPasswordFormName}
          onSubmit={handleSubmit}
          onChange={handleChange}
          style={{ display: state === State.PENDING ? "" : "none" }}
        >
          <Field
            type="text"
            name="resetToken"
            value={token}
            onChange={(e) => setIdAndToken([userId, e.target.value])}
          >
            Enter your reset token:
          </Field>
          <FormGroup>
            <Field
              name="password"
              placeholder="Choose a new passphrase."
              autoComplete="new-password"
              type="password"
              data-cy="registerpage-input-password"
            >
              Passphrase
            </Field>
            <PasswordStrength
              passwordStrength={passwordStrength}
              suggestions={passwordSuggestions}
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
            <Alert type="danger">
              <Alert.Heading>Error reseting passphrase:</Alert.Heading>
              <Alert.Body>
                {error.message ? String(error.message) : String(error)}
              </Alert.Body>
            </Alert>
          ) : null}
          <SubmitButton>
            <Button data-cy="resetpage-submit-button">Reset passphrase</Button>
          </SubmitButton>
        </Form>
      </FormWrapper>
    </SharedLayout>
  );
};

ResetPage.getInitialProps = async ({ query: { user_id, token } = {} }) => ({
  userId: typeof user_id === "number" ? user_id : 0,
  token: typeof token === "string" ? token : null,
});

export default ResetPage;
