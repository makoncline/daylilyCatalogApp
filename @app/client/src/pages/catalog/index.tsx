import {
  ErrorAlert,
  Lilies,
  Redirect,
  SEO,
  SharedLayout,
} from "@app/components";
import { Center, Spinner } from "@app/design";
import { useSharedQuery } from "@app/graphql";
import { loginUrl } from "@app/lib";
import { NextPage } from "next";
import React from "react";

const Catalog: NextPage = () => {
  const query = useSharedQuery();
  const { data, loading, error } = query;
  const user = data && data.currentUser;
  const pageContent = (() => {
    if (error && !loading) {
      return <ErrorAlert error={error} />;
    } else if (!user && !loading) {
      return <Redirect href={`${loginUrl}?next=${encodeURIComponent("/")}`} />;
    } else if (!user) {
      return "Loading";
    } else {
      return <Lilies />;
    }
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
