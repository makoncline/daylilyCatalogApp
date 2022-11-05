import {
  ErrorAlert,
  FourOhFour,
  ListingDisplay,
  SharedLayout,
} from "@app/components";
import { useLilyByIdQuery } from "@app/graphql";
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
    if (loading) {
      return "Loading";
    }
    if (error) {
      return <ErrorAlert error={error} />;
    }
    if (!listing) {
      return <FourOhFour currentUser={user} />;
    }
    return <ListingDisplay listing={listing} userId={user?.id || null} />;
  })();
  return (
    <SharedLayout title={data?.lily?.name} query={query}>
      {pageContent}
    </SharedLayout>
  );
};

export default View;
