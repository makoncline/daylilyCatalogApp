import {
  EditListForm,
  ErrorAlert,
  FourOhFour,
  Redirect,
  SEO,
  SharedLayout,
} from "@app/components";
import { useListByIdQuery } from "@app/graphql";
import { loginUrl, toViewUserUrl } from "@app/lib";
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
    if (loading) {
      return "Loading";
    }
    if (error) {
      return <ErrorAlert error={error} />;
    }
    if (!user) {
      return <Redirect href={`${loginUrl}?next=${encodeURIComponent("/")}`} />;
    }
    if (!list) {
      return <FourOhFour currentUser={user} />;
    }
    if (user.id !== list.userId) {
      return <Redirect href={toViewUserUrl(list.id)} />;
    }
    return <EditListForm list={list} />;
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
