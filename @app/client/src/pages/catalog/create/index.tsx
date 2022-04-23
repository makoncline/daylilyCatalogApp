import { ApolloError } from "@apollo/client";
import { ErrorAlert, Redirect, SharedLayout } from "@app/components";
import { useSharedQuery } from "@app/graphql";
import { loginUrl } from "@app/lib";
import { NextPage } from "next";
import React, { useState } from "react";

import { CreateListingForm } from "./CreateListingForm";

const Edit: NextPage = () => {
  const query = useSharedQuery();
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const {
    data: sharedQueryData,
    loading: sharedQueryLoading,
    error: sharedQueryError,
  } = query;

  return (
    <SharedLayout title="Create Listing" query={query}>
      {sharedQueryData?.currentUser ? (
        <>
          <CreateListingForm error={error} setError={setError} />
        </>
      ) : sharedQueryLoading ? (
        "Loading..."
      ) : sharedQueryError ? (
        <ErrorAlert error={sharedQueryError} />
      ) : (
        <Redirect href={`${loginUrl}?next=${encodeURIComponent("/")}`} />
      )}
    </SharedLayout>
  );
};

export default Edit;
