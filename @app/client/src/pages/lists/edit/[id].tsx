import {
  EditListForm,
  ErrorAlert,
  Redirect,
  SharedLayout,
} from "@app/components";
import { useListByIdQuery, useSharedQuery } from "@app/graphql";
import { loginUrl } from "@app/lib";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";

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
    <SharedLayout title="Edit List" query={query}>
      {sharedQueryData?.currentUser && listQueryData?.list ? (
        <EditListForm list={listQueryData.list} />
      ) : sharedQueryLoading || listQueryLoading ? (
        "Loading..."
      ) : sharedQueryError || listQueryError ? (
        <>
          {sharedQueryError && <ErrorAlert error={sharedQueryError} />}
          {listQueryError && <ErrorAlert error={listQueryError} />}
        </>
      ) : (
        <Redirect href={`${loginUrl}?next=${encodeURIComponent("/")}`} />
      )}
    </SharedLayout>
  );
};

export default Edit;
