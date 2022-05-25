import { Alert, Button } from "@app/design";
import React from "react";

export const UploadDisabledNotVerified = () => (
  <Alert type="danger">
    <Alert.Heading>Image upload disabled</Alert.Heading>
    <Alert.Body>
      You must verify your email address to upload photos. A verification link
      has been sent to your email address. Please click the link in that email
      to verify.
    </Alert.Body>
    <Alert.Actions>
      <Button
        styleType="primary"
        href={`${process.env.ROOT_URL}/settings/emails`}
      >
        View email settings
      </Button>
    </Alert.Actions>
  </Alert>
);
export const UploadDisabledNoMembership = () => (
  <Alert type="danger">
    <Alert.Heading>Image upload disabled</Alert.Heading>
    <Alert.Body>
      <p>You must have an active membership to upload photos.</p>
    </Alert.Body>
    <Alert.Actions>
      <Button href={`${process.env.ROOT_URL}/membership`}>
        Become a Daylily Catalog Member
      </Button>
    </Alert.Actions>
  </Alert>
);
