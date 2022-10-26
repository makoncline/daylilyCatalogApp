import { ApolloError } from "@apollo/client";
import {
  EditListingForm,
  ErrorAlert,
  Redirect,
  SharedLayout,
} from "@app/components";
import { Center, Spinner } from "@app/design";
import { useLilyByIdQuery, useSharedQuery } from "@app/graphql";
import { loginUrl } from "@app/lib";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";

const Edit: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const listingId = (typeof id === "string" && parseInt(id)) || null;
  const query = useLilyByIdQuery({
    variables: { id: listingId || 0 },
  });
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const { data, loading, error: queryError } = query;

  if (!listingId) return <p>invalid id: {id}</p>;
  const listing = data && data.lily;
  const user = data && data.currentUser;
  const isActive =
    user?.stripeSubscription?.subscriptionInfo?.status == "active";
  const isFree = user?.freeUntil
    ? new Date() < new Date(user.freeUntil)
    : false;
  const isPhotoUploadActive = user?.isVerified && (isFree || isActive);
  const isPhotoUploadEnabled = !user?.isVerified
    ? "NOT_VERIFIED"
    : !isPhotoUploadActive
    ? "NO_MEMBERSHIP"
    : "ENABLED";

  const pageContent = (() => {
    if (error && !loading) {
      return <ErrorAlert error={error} />;
    } else if (!data && !loading) {
      return <Redirect href={`${loginUrl}?next=${encodeURIComponent("/")}`} />;
    } else if (!user || !listing) {
      return "Loading";
    } else {
      return (
        <EditListingForm
          error={error}
          setError={setError}
          isPhotoUploadEnabled={isPhotoUploadEnabled}
          listing={listing}
        />
      );
    }
  })();

  return (
    <SharedLayout title="Edit Listing" query={query}>
      {pageContent}
    </SharedLayout>
  );
};

export default Edit;
