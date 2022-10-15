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
  const { data, loading, error } = useSharedQuery();

  const query = useSharedQuery();
  return (
    <SharedLayout title="Catalog" query={query}>
      <SEO
        title="Catalog"
        description="Manage your Daylily Catalog listings. View, sort, filter, add, edit, and delete your listings."
        noRobots
      />
      {data && data.currentUser ? (
        <Lilies />
      ) : loading ? (
        <Center>
          <Spinner />
        </Center>
      ) : error ? (
        <ErrorAlert error={error} />
      ) : (
        <Redirect href={`${loginUrl}?next=${encodeURIComponent("/")}`} />
      )}
    </SharedLayout>
  );
};

export default Catalog;
