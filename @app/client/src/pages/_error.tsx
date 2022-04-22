import { ErrorOccurred, FourOhFour, SharedLayout } from "@app/components";
import { Alert, Heading, Space } from "@app/design";
import { useSharedQuery } from "@app/graphql";
import { NextPage } from "next";
import Link from "next/link";
import * as React from "react";

const isDev = process.env.NODE_ENV !== "production";

interface SocialAuthErrorProps {
  provider: string;
}

function SocialAuthError({ provider }: SocialAuthErrorProps) {
  return (
    <div>
      <Heading level={2}>
        This application is not configured for that auth provider
      </Heading>
      <p>
        Please try and{" "}
        <Link href="/login">
          <a>login with another method</a>
        </Link>
        .
      </p>
      {isDev && (
        <Alert type="info">
          <Alert.Heading>Development Only Error</Alert.Heading>
          <Alert.Body>
            <div>
              You seem to be trying to log in with the '<code>{provider}</code>'
              OAuth provider. You should check that{" "}
              <code>{`${provider}_key`.toUpperCase()}</code> and any other
              required variables are set in your environment (e.g.{" "}
              <code>.env</code> file). If they are, check the provider is
              configured in{" "}
              <code>@app/server/src/middleware/installPassport.ts</code>
            </div>
          </Alert.Body>
        </Alert>
      )}
    </div>
  );
}

interface ErrorPageProps {
  statusCode: number | null;
  pathname: string | null;
}

interface ErrorComponentSpec<TProps> {
  title: string;
  Component: React.FC<TProps>;
  props?: TProps;
}

const getDisplayForError = (props: ErrorPageProps): ErrorComponentSpec<any> => {
  const { statusCode, pathname } = props;

  const authMatches = pathname ? pathname.match(/^\/auth\/([^/?#]+)/) : null;
  if (authMatches) {
    return {
      Component: SocialAuthError,
      title: "Application not configured for this auth provider",
      props: {
        provider: decodeURIComponent(authMatches[1]),
      },
    };
  }

  switch (statusCode) {
    case 404:
      return {
        Component: FourOhFour,
        title: "Page Not Found",
      };
    default:
      return {
        Component: ErrorOccurred,
        title: "An Error Occurred",
      };
  }
};

const ErrorPage: NextPage<ErrorPageProps> = (props) => {
  const { Component, title, props: componentProps } = getDisplayForError(props);
  const query = useSharedQuery();
  return (
    <SharedLayout title={title} query={query}>
      <Space>
        <Space direction="column">
          <Component {...componentProps} />
        </Space>
      </Space>
    </SharedLayout>
  );
};

ErrorPage.getInitialProps = async ({ res, err, asPath }) => ({
  pathname: asPath || null,
  statusCode: res ? res.statusCode : err ? err["statusCode"] || null : null,
});

export default ErrorPage;
