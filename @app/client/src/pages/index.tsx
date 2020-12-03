import { ErrorAlert, Lilies, Redirect, SharedLayout } from "@app/components";
import { useSharedQuery } from "@app/graphql";
import { NextPage } from "next";
import React from "react";

const Catalog: NextPage = () => {
  const { data, loading, error } = useSharedQuery();

  const query = useSharedQuery();
  return (
    <SharedLayout title="Catalog" query={query}>
      {data && data.currentUser ? (
        <Lilies />
      ) : loading ? (
        "Loading..."
      ) : error ? (
        <ErrorAlert error={error} />
      ) : (
        <Redirect href={`/login?next=${encodeURIComponent("/")}`} />
      )}
    </SharedLayout>
  );
};

export default Catalog;
