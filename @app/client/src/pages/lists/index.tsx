import { ErrorAlert, Lists, Redirect, SharedLayout } from "@app/components";
import { useSharedQuery } from "@app/graphql";
import { loginUrl } from "@app/lib";
import { NextPage } from "next";
import React from "react";

const ListsPage: NextPage = () => {
  const { data, loading, error } = useSharedQuery();
  const user = data && data.currentUser;

  const pageContent = (() => {
    if (error && !loading) {
      return <ErrorAlert error={error} />;
    } else if (!user && !loading) {
      return <Redirect href={`${loginUrl}?next=${encodeURIComponent("/")}`} />;
    } else if (!user) {
      return "Loading";
    } else {
      return <Lists />;
    }
  })();
  const query = useSharedQuery();
  return (
    <SharedLayout title="Lists" query={query}>
      {pageContent}
    </SharedLayout>
  );
};

export default ListsPage;
