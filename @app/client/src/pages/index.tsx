import { ErrorAlert, Lilies, Redirect, SharedLayout } from "@app/components";
import { useSharedQuery } from "@app/graphql";
import { NextPage } from "next";
import React from "react";

const Catalog: NextPage = () => {
  const { data, loading, error } = useSharedQuery();
  const user = data && data.currentUser;

  const pageContent = (() => {
    if (error && !loading) {
      return <ErrorAlert error={error} />;
    } else if (!user && !loading) {
      return <Redirect href={`/login?next=${encodeURIComponent("/")}`} />;
    } else if (!user) {
      return "Loading";
    } else {
      return (
        <>
          <Lilies />
        </>
      );
    }
  })();
  const query = useSharedQuery();
  return (
    <SharedLayout title="Catalog" query={query}>
      {pageContent}
    </SharedLayout>
  );
};

export default Catalog;
