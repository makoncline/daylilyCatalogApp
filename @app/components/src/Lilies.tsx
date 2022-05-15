import { Alert, Button, Space, useForm } from "@app/design";
import { useLiliesQuery } from "@app/graphql";
import { toCreateListingUrl } from "@app/lib";
import React from "react";

import { LiliesTable } from "./";

export const Lilies = () => {
  const { data } = useLiliesQuery();
  const user = data && data.currentUser;
  const userLilies = user && user.lilies.nodes;

  if (!user || !userLilies) return <p>Loading...</p>;

  const isActive =
    user.stripeSubscription?.subscriptionInfo?.status == "active";
  const isOverFreeLimit = userLilies.length >= 99;
  const isFree = user.freeUntil ? new Date() < new Date(user.freeUntil) : false;
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
      <LiliesTable dataSource={userLilies || []} />
    </Space>
  );
};
