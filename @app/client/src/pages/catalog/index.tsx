import { ErrorAlert, Lilies, Redirect, SharedLayout } from "@app/components";
import { Center, Spinner } from "@app/design";
import { useSharedQuery } from "@app/graphql";
import { loginUrl } from "@app/lib";
import { NextPage } from "next";
import Head from "next/head";
import React from "react";

const Catalog: NextPage = () => {
  const { data, loading, error } = useSharedQuery();

  const query = useSharedQuery();
  return (
    <SharedLayout title="Catalog" query={query}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
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
