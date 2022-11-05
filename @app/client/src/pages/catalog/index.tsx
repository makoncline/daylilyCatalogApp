import {
  ErrorAlert,
  Lilies,
  Redirect,
  SEO,
  SharedLayout,
} from "@app/components";
import { useLiliesQuery } from "@app/graphql";
import { loginUrl } from "@app/lib";
import { NextPage } from "next";
import React from "react";

const Catalog: NextPage = () => {
  const query = useLiliesQuery();
  const { data, loading, error } = query;
  const user = data && data.currentUser;
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
    const listings = user?.lilies.nodes;
    const isActive =
      user.stripeSubscription?.subscriptionInfo?.status == "active";
    const isOverFreeLimit = listings.length >= 99;
    const isFree = user.freeUntil
      ? new Date() < new Date(user.freeUntil)
      : false;
    const canAddListing = isFree || isActive || !isOverFreeLimit;
    return <Lilies listings={listings} canAddListing={canAddListing} />;
  })();

  return (
    <SharedLayout title="Catalog" query={query}>
      <SEO
        title="Catalog"
        description="Manage your Daylily Catalog listings. View, sort, filter, add, edit, and delete your listings."
        noRobots
      />
      {pageContent}
    </SharedLayout>
  );
};

export default Catalog;
