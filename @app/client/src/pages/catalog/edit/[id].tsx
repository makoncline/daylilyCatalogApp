import {
  EditListingForm,
  ErrorAlert,
  FourOhFour,
  Redirect,
  SharedLayout,
} from "@app/components";
import { useLilyByIdQuery } from "@app/graphql";
import { loginUrl, toViewListingUrl } from "@app/lib";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";

const Edit: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const listingId = (typeof id === "string" && parseInt(id)) || null;
  const query = useLilyByIdQuery({
    variables: { id: listingId || 0 },
  });
  const { data, loading, error } = query;

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
    if (loading) {
      return "Loading";
    }
    if (error) {
      return <ErrorAlert error={error} />;
    }
    if (!user) {
      return <Redirect href={`${loginUrl}?next=${encodeURIComponent("/")}`} />;
    }
    if (!listing) {
      return <FourOhFour currentUser={user} />;
    }
    if (user.id !== listing.user?.id) {
      return <Redirect href={toViewListingUrl(listing.id)} />;
    }
    return (
      <EditListingForm
        isPhotoUploadEnabled={isPhotoUploadEnabled}
        listing={listing}
      />
    );
  })();

  return (
    <SharedLayout title="Edit Listing" query={query}>
      {pageContent}
    </SharedLayout>
  );
};

export default Edit;
