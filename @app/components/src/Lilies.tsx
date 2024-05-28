import { Alert, Button, Center, Space, Spinner } from "@app/design";
import { useLiliesQuery } from "@app/graphql";
import { toCreateListingUrl } from "@app/lib";
import { useRouter } from "next/router";
import React from "react";

import { LiliesTable, useReactTable } from "./";
import { download } from "./util/download";

export const Lilies = () => {
  const { data } = useLiliesQuery();
  const user = data && data.currentUser;
  const userLilies = user && user.lilies.nodes;
  const router = useRouter();
  const initialState = React.useMemo(() => {
    if (router.query.state) {
      try {
        return JSON.parse(router.query.state as string);
      } catch (e) {
        console.error("Failed to parse state from URL", e);
      }
    }
    return {};
  }, [router.query.state]);
  const table = useReactTable({
    rawData: userLilies || [],
    isOwner: false,
    initialState,
  });
  const handleDownloadData = () => {
    download(userLilies || []);
  };

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
      {userLilies.length ? (
        <LiliesTable
          table={table}
          isOwner={true}
          downloadData={handleDownloadData}
        />
      ) : (
        <p>No listings found. Create a listing to get started.</p>
      )}
    </Space>
  );
};
