import { Alert, Button, Space } from "@app/design";
import { UserLilyDataFragment } from "@app/graphql";
import { toCreateListingUrl } from "@app/lib";
import React from "react";

import { LiliesTable } from "./";

export const Lilies = ({
  listings,
  canAddListing,
}: {
  listings: UserLilyDataFragment[];
  canAddListing: boolean;
}) => {
  return (
    <Space direction="column" block center>
      {!canAddListing && (
        <Alert type="info">
          <Alert.Heading>Create listing disabled</Alert.Heading>
          <Alert.Body>
            <p>
              You have reached the free plan limit. You must have an active
              membership to add more daylilies.
            </p>
          </Alert.Body>
          <Alert.Actions>
            <Button
              href={`${process.env.ROOT_URL}/membership`}
              styleType="primary"
              block
            >
              Become a Daylily Catalog Member
            </Button>
          </Alert.Actions>
        </Alert>
      )}
      {canAddListing && (
        <Button href={`${process.env.ROOT_URL}${toCreateListingUrl()}`} block>
          {listings.length > 0 ? "Create listing" : "Create your first listing"}
        </Button>
      )}
      {listings.length > 0 && (
        <LiliesTable dataSource={listings} isOwner={true} />
      )}
    </Space>
  );
};
