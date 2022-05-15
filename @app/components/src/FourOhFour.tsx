import { Alert, Button } from "@app/design";
import { User } from "@app/graphql";
import React from "react";

interface FourOhFourProps {
  currentUser?: Pick<User, "id"> | null;
}
export function FourOhFour(props: FourOhFourProps) {
  const { currentUser } = props;
  return (
    <div data-cy="fourohfour-div">
      <Alert type="danger">
        <Alert.Heading>404</Alert.Heading>
        <Alert.Body>
          The page you attempted to load was not found.
          {currentUser ? "" : " Maybe you need to log in?"}
        </Alert.Body>
        <Alert.Actions>
          <Button styleType="primary" href="/">
            Back Home
          </Button>
        </Alert.Actions>
      </Alert>
    </div>
  );
}
