import { Alert, Button, Center, Space, Spinner } from "@app/design";
import { useLiliesQuery } from "@app/graphql";
import { toCreateListingUrl } from "@app/lib";
import React from "react";

import { LiliesTable } from "./";

export const Lilies = () => {
  const { data } = useLiliesQuery();
  const user = data && data.currentUser;
  const userLilies = user && user.lilies.nodes;

  if (!user || !userLilies)
    return (
      <Center>
        <Spinner />
      </Center>
    );

  const isActive =
    user.stripeSubscription?.subscriptionInfo?.status == "active";

  // TODO: turn this back on once fixed
  // const isOverFreeLimit = userLilies.length >= 99;
  // const isFree = getIsFree(user?.freeUntil);
  const isOverFreeLimit = false;
  const isFree = true;

  const isAddActive = isFree || isActive || !isOverFreeLimit;
  return (
    <Space direction="column" block center>
      {!isAddActive && (
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
      {isAddActive && (
        <Button href={`${process.env.ROOT_URL}${toCreateListingUrl()}`} block>
          Create listing
        </Button>
      )}
      <LiliesTable dataSource={userLilies || []} isOwner={true} />
    </Space>
  );
};
