import {
  CreateListForm,
  ErrorAlert,
  Redirect,
  SEO,
  SharedLayout,
} from "@app/components";
import { Center, Spinner } from "@app/design";
import { useSharedQuery } from "@app/graphql";
import { loginUrl } from "@app/lib";
import { NextPage } from "next";
import React from "react";

const Create: NextPage = () => {
  const query = useSharedQuery();
  const {
    data: sharedQueryData,
    loading: sharedQueryLoading,
    error: sharedQueryError,
  } = query;

  return (
    <SharedLayout title="Create List" query={query}>
      <SEO
        title="Create List"
        description="Create a new list for your Daylily Catalog"
        noRobots
      />
      {sharedQueryData?.currentUser ? (
        <CreateListForm />
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

export default Create;
