import {
  ErrorAlert,
  ListingDisplay,
  Redirect,
  SharedLayout,
} from "@app/components";
import { useSharedQuery } from "@app/graphql";
import { loginUrl } from "@app/lib";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";

const View: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const query = useSharedQuery();
  const {
    data: sharedQueryData,
    loading: sharedQueryLoading,
    error: sharedQueryError,
  } = query;

  const lilyId = (typeof id === "string" && parseInt(id)) || null;
  if (!lilyId) return <p>invalid id: {id}</p>;
  return (
    <SharedLayout title="Listing" query={query}>
      {sharedQueryData?.currentUser ? (
        <ListingDisplay
          listingId={lilyId}
          userId={sharedQueryData.currentUser.id}
        />
      ) : sharedQueryLoading ? (
        "Loading..."
      ) : sharedQueryError ? (
        <ErrorAlert error={sharedQueryError} />
      ) : (
        <Redirect href={`${loginUrl}?next=${encodeURIComponent("/")}`} />
      )}
    </SharedLayout>
  );
};

export default View;
