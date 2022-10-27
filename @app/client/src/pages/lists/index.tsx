import {
  ErrorAlert,
  FourOhFour,
  Lists,
  Redirect,
  SEO,
  SharedLayout,
} from "@app/components";
import { useListsQuery } from "@app/graphql";
import { loginUrl } from "@app/lib";
import { NextPage } from "next";
import React from "react";

const ListsPage: NextPage = () => {
  const query = useListsQuery();
  const { data, loading, error } = query;
  const user = data && data.currentUser;
  const lists = data && data.currentUser?.lists.nodes;

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
    if (lists === undefined) {
      return <FourOhFour currentUser={user} />;
    }
    return <Lists lists={lists} />;
  })();
  return (
    <SharedLayout title="Lists" query={query}>
      <SEO
        title="Lists"
        description="Add and edit your Daylily Catalog lists."
        noRobots
      />
      {pageContent}
    </SharedLayout>
  );
};

export default ListsPage;
