import { ApolloError } from "@apollo/client";
import {
  CreateListingForm,
  ErrorAlert,
  Redirect,
  SharedLayout,
} from "@app/components";
import { Center, Spinner } from "@app/design";
import { useSharedQuery } from "@app/graphql";
import { loginUrl } from "@app/lib";
import { NextPage } from "next";
import React, { useState } from "react";

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
        <CreateListingForm error={error} setError={setError} />
      ) : sharedQueryLoading ? (
        <Center>
          <Spinner />
        </Center>
      ) : sharedQueryError ? (
        <ErrorAlert error={sharedQueryError} />
      ) : (
        <Redirect href={`${loginUrl}?next=${encodeURIComponent("/")}`} />
      )}
    </SharedLayout>
  );
};

export default Edit;
