import { ApolloError } from "@apollo/client";
import {
  EditListingForm,
  ErrorAlert,
  Redirect,
  SharedLayout,
} from "@app/components";
import { Center, Spinner } from "@app/design";
import { useSharedQuery } from "@app/graphql";
import { loginUrl } from "@app/lib";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";

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
    <SharedLayout title="Edit Listing" query={query}>
      {sharedQueryData?.currentUser ? (
        <EditListingForm error={error} setError={setError} id={lilyId} />
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
