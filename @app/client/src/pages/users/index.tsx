import { ErrorAlert, SharedLayout, UsersTable } from "@app/components";
import { Center, Spinner } from "@app/design";
import { useSharedQuery, useUsersQuery } from "@app/graphql";
import { NextPage } from "next";
import React from "react";

const View: NextPage = () => {
  const sharedQuery = useSharedQuery();
  const { loading: sharedQueryLoading, error: sharedQueryError } = sharedQuery;
  const usersQuery = useUsersQuery();
  const {
    data: usersQueryData,
    loading: usersQueryLoading,
    error: usersQueryError,
  } = usersQuery;

  const isLoading = sharedQueryLoading || usersQueryLoading;
  const isError = sharedQueryError || usersQueryError;
  return (
    <SharedLayout title="Users" query={sharedQuery}>
      {isLoading ? (
        <Center>
          <Spinner />
        </Center>
      ) : isError ? (
        <>
          {sharedQueryError && <ErrorAlert error={sharedQueryError} />}
          {usersQueryError && <ErrorAlert error={usersQueryError} />}
        </>
      ) : usersQueryData ? (
        <UsersTable data={usersQueryData} />
      ) : (
        <p>Users not found...</p>
      )}
    </SharedLayout>
  );
};

export default View;
