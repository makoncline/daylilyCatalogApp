import { ApolloError } from "@apollo/client";
import { ErrorAlert, Redirect, SharedLayout } from "@app/components";
import { useSharedQuery } from "@app/graphql";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { EditListingForm } from "./EditListingForm";

const Edit: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const query = useSharedQuery();
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const {
    data: sharedQueryData,
    loading: sharedQueryLoading,
    error: sharedQueryError,
  } = query;

  const lilyId = (typeof id === "string" && parseInt(id)) || null;
  if (!lilyId) return <p>invalid id: {id}</p>;

  return (
    <SharedLayout title="Create" query={query}>
      {sharedQueryData?.currentUser ? (
        <EditListingForm error={error} setError={setError} id={lilyId} />
      ) : sharedQueryLoading ? (
        "Loading..."
      ) : sharedQueryError ? (
        <ErrorAlert error={sharedQueryError} />
      ) : (
        <Redirect href={`/login?next=${encodeURIComponent("/")}`} />
      )}
    </SharedLayout>
  );
};

export default Edit;
