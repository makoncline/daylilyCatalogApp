import { ApolloError } from "@apollo/client";
import { Alert, Button } from "@app/design";
import Link from "next/link";
import React from "react";

export interface ErrorAlertProps {
  error: ApolloError | Error;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  const code: string | undefined = (error as any)?.networkError?.result
    ?.errors?.[0]?.code;
  if (code === "EBADCSRFTOKEN") {
    return (
      <Alert type="danger">
        <Alert.Heading>Invalid CSRF token</Alert.Heading>
        <Alert.Body>
          Our security protections have failed to authenticate your request; to
          solve this you need to refresh the page:
        </Alert.Body>
        <Alert.Actions>
          <Button styleType="primary" onClick={() => window.location.reload()}>
            Refresh page
          </Button>
        </Alert.Actions>
      </Alert>
    );
  }
  return (
    <Alert type="danger">
      <Alert.Heading>Unexpected error occurred</Alert.Heading>
      <Alert.Body>
        <span>
          We're really sorry, but an unexpected error occurred. Please{" "}
          <Link href="/">
            <a>return to the homepage</a>
          </Link>
          and try again.
        </span>
        {error.message}
      </Alert.Body>
    </Alert>
  );
}
