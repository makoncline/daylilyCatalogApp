import {
  CreateListingForm,
  ErrorAlert,
  Redirect,
  SharedLayout,
} from "@app/components";
import { useSharedQuery } from "@app/graphql";
import { loginUrl } from "@app/lib";
import { NextPage } from "next";
import React from "react";

const Edit: NextPage = () => {
  const query = useSharedQuery();
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
    return <CreateListingForm />;
  })();
  return (
    <SharedLayout title="Create Listing" query={query}>
      {pageContent}
    </SharedLayout>
  );
};

export default Edit;
