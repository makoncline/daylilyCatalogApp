import { ErrorAlert, Redirect, SharedLayout } from "@app/components";
import { useListByIdQuery, useSharedQuery } from "@app/graphql";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";

import { EditListForm } from "./EditListForm";

const Edit: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const query = useSharedQuery();
  const {
    data: sharedQueryData,
    loading: sharedQueryLoading,
    error: sharedQueryError,
  } = query;
  const {
    data: listQueryData,
    loading: listQueryLoading,
    error: listQueryError,
  } = useListByIdQuery({ variables: { id: parseInt(id as string) } });

  return (
    <SharedLayout title="Create" query={query}>
      {sharedQueryData?.currentUser && listQueryData?.list ? (
        <EditListForm list={listQueryData.list} />
      ) : sharedQueryLoading || listQueryLoading ? (
        "Loading..."
      ) : sharedQueryError || listQueryError ? (
        <ErrorAlert error={sharedQueryError} />
      ) : (
        <Redirect href={`/login?next=${encodeURIComponent("/")}`} />
      )}
    </SharedLayout>
  );
};

export default Edit;
