import {
  ErrorAlert,
  ListingDisplay,
  Redirect,
  SharedLayout,
} from "@app/components";
import { useLilyByIdQuery, useSharedQuery } from "@app/graphql";
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

  const listingId = (typeof id === "string" && parseInt(id)) || null;
  const { data, loading, error } = useLilyByIdQuery({
    variables: { id: listingId || 0 },
  });
  if (!listingId) return <p>invalid id: {id}</p>;
  return (
    <SharedLayout title={data?.lily?.name} query={query}>
      {sharedQueryData?.currentUser ? (
        <ListingDisplay
          listingId={listingId}
          data={data}
          loading={loading}
          error={error}
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
