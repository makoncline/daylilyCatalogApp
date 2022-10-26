import {
  ErrorAlert,
  ListingDisplay,
  Redirect,
  SharedLayout,
} from "@app/components";
import { Center, Spinner } from "@app/design";
import { useLilyByIdQuery, useSharedQuery } from "@app/graphql";
import { loginUrl } from "@app/lib";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";

const View: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const listingId = (typeof id === "string" && parseInt(id)) || null;
  const query = useLilyByIdQuery({
    variables: { id: listingId || 0 },
  });
  const { data, loading, error } = query;
  const user = data && data.currentUser;
  const listing = data && data.lily;

  const pageContent = (() => {
    if (error && !loading) {
      return <ErrorAlert error={error} />;
    } else if (!data && !loading) {
      return <Redirect href={`${loginUrl}?next=${encodeURIComponent("/")}`} />;
    } else if (!listing) {
      return "Loading";
    } else {
      return <ListingDisplay listing={listing} userId={user?.id || null} />;
    }
  })();
  if (!listingId) return <p>invalid id: {id}</p>;
  return (
    <SharedLayout title={data?.lily?.name} query={query}>
      {pageContent}
    </SharedLayout>
  );
};

export default View;
