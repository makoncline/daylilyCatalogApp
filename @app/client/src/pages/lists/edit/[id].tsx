import {
  EditListForm,
  ErrorAlert,
  Redirect,
  SEO,
  SharedLayout,
} from "@app/components";
import { Center, Spinner } from "@app/design";
import { useListByIdQuery, useSharedQuery } from "@app/graphql";
import { loginUrl } from "@app/lib";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";

const Edit: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const userId = parseInt(id as string, 10);
  const query = useListByIdQuery({ variables: { id: userId } });
  const { data, loading, error } = query;
  const user = data && data.currentUser;
  const list = data && data.list;
  const pageContent = (() => {
    if (error && !loading) {
      return <ErrorAlert error={error} />;
    } else if (!data && !loading) {
      <Redirect href={`${loginUrl}?next=${encodeURIComponent("/")}`} />;
    } else if (!user || !list) {
      return "Loading";
    } else {
      return <EditListForm list={list} />;
    }
  })();

  return (
    <SharedLayout title="Edit List" query={query}>
      <SEO
        title="Edit List"
        description="Edit your Daylily Catalog list."
        noRobots
      />
      {pageContent}
    </SharedLayout>
  );
};

export default Edit;
