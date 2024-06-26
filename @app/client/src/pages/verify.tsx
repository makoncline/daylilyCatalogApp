import { SEO, SharedLayout } from "@app/components";
import { Alert, Space } from "@app/design";
import { useSharedQuery, useVerifyEmailMutation } from "@app/graphql";
import get from "lodash/get";
import { NextPage } from "next";
import React, { useEffect } from "react";

interface IProps {
  id: number | null;
  token: string | null;
}

const VerifyPage: NextPage<IProps> = (props) => {
  const [[id, token], setIdAndToken] = React.useState<[number, string]>([
    props.id || 0,
    props.token || "",
  ]);
  const [state, setState] = React.useState<
    "PENDING" | "SUBMITTING" | "SUCCESS"
  >(props.id && props.token ? "SUBMITTING" : "PENDING");
  const [error, setError] = React.useState<Error | null>(null);
  const [verifyEmail] = useVerifyEmailMutation();
  useEffect(() => {
    if (state === "SUBMITTING") {
      setError(null);
      verifyEmail({
        variables: {
          id,
          token,
        },
      })
        .then((result) => {
          if (get(result, "data.verifyEmail.success")) {
            setState("SUCCESS");
          } else {
            setState("PENDING");
            setError(new Error("Incorrect token, please check and try again"));
          }
        })
        .catch((e: Error) => {
          setError(e);
          setState("PENDING");
        });
    }
  }, [id, token, state, props, verifyEmail]);
  function form() {
    return (
      <form onSubmit={() => setState("SUBMITTING")}>
        <p>Please enter your email verification code</p>
        <input
          type="text"
          value={token}
          onChange={(e) => setIdAndToken([id, e.target.value])}
        />
        {error ? <p>{error.message || error}</p> : null}
        <button>Submit</button>
      </form>
    );
  }
  const query = useSharedQuery();
  return (
    <SharedLayout title="Verify Email Address" query={query}>
      <SEO
        title="Verify Email Address"
        description="Verify your email address to enable all features of your Daylily Catalog account."
        noRobots
      />
      <Space>
        <Space direction="column">
          {state === "PENDING" ? (
            form()
          ) : state === "SUBMITTING" ? (
            "Submitting..."
          ) : state === "SUCCESS" ? (
            <Alert type="success">
              <Alert.Heading>Email Verified</Alert.Heading>
              <Alert.Body>
                Thank you for verifying your email address. You may now close
                this window.
              </Alert.Body>
            </Alert>
          ) : (
            "Unknown state"
          )}
        </Space>
      </Space>
    </SharedLayout>
  );
};

VerifyPage.getInitialProps = async ({ query: { id, token } }) => ({
  id: typeof id === "string" ? parseInt(id, 10) || null : null,
  token: typeof token === "string" ? token : null,
});

export default VerifyPage;
