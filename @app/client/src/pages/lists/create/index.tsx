import {
  CreateListForm,
  ErrorAlert,
  Redirect,
  SEO,
  SharedLayout,
} from "@app/components";
import { useSharedQuery } from "@app/graphql";
import { loginUrl } from "@app/lib";
import { NextPage } from "next";
import React from "react";

const Create: NextPage = () => {
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
    return <CreateListForm />;
  })();

  return (
    <SharedLayout title="Create List" query={query}>
      <SEO
        title="Create List"
        description="Create a new list for your Daylily Catalog"
        noRobots
      />
      {pageContent}
    </SharedLayout>
  );
};

export default Create;
