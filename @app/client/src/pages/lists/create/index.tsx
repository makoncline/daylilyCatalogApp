import { ErrorAlert, Redirect, SharedLayout } from "@app/components";
import { useSharedQuery } from "@app/graphql";
import { NextPage } from "next";
import React from "react";

import { CreateListForm } from "./CreateListForm";

const Create: NextPage = () => {
  const query = useSharedQuery();
  const {
    data: sharedQueryData,
    loading: sharedQueryLoading,
    error: sharedQueryError,
  } = query;

  return (
    <SharedLayout title="Create" query={query}>
      {sharedQueryData?.currentUser ? (
        <CreateListForm />
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

export default Create;
