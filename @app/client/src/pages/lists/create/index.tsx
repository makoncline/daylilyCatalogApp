import { ErrorAlert, Redirect, SharedLayout } from "@app/components";
import { useSharedQuery } from "@app/graphql";
import { loginUrl } from "@app/lib";
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
    <SharedLayout title="Create List" query={query}>
      {sharedQueryData?.currentUser ? (
        <CreateListForm />
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

export default Create;
