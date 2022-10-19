import { ErrorAlert, SEO, SharedLayout, UsersTable } from "@app/components";
import { Center, Spinner } from "@app/design";
import { useSharedQuery, useUsersQuery } from "@app/graphql";
import { NextPage } from "next";
import React from "react";

const UsersPage: NextPage = () => {
  const query = useUsersQuery();
  const { data, loading, error } = query;
  const users = data?.users?.nodes || [];
  const pageContent = (() => {
    if (error && !loading) {
      return <ErrorAlert error={error} />;
    } else if (!data) {
      return "Loading";
    } else {
      return <UsersTable users={users} />;
    }
  })();
  return (
    <SharedLayout title="Users" query={query}>
      <SEO
        title={`Check out these daylily catalogs. Thousands of daylilies for sale.`}
        description="View garden information, daylily lists, and daylily listings. Buy daylilies online from daylily catalog users."
      />
      {pageContent}
    </SharedLayout>
  );
};

export default UsersPage;
