import { ErrorAlert, Redirect, SharedLayout } from "@app/components";
import { Field, Form, FormContextProps } from "@app/design";
import { useSharedQuery } from "@app/graphql";
import { NextPage } from "next";
import React from "react";

const Create: NextPage = () => {
  const { data, loading, error } = useSharedQuery();

  const query = useSharedQuery();
  return (
    <SharedLayout title="Create" query={query}>
      {data && data.currentUser ? (
        <NewAddLilyForm />
      ) : loading ? (
        "Loading..."
      ) : error ? (
        <ErrorAlert error={error} />
      ) : (
        <Redirect href={`/login?next=${encodeURIComponent("/")}`} />
      )}
    </SharedLayout>
  );
};

export default Create;
const NewAddLilyForm = () => {
  return (
    <Form onSubmit={({ values }: FormContextProps) => console.log(values)}>
      <Field>Link to</Field>
      <Field>Name</Field>
      <Field>List</Field>
      <Field>Price</Field>
      <Field>Public note</Field>
      <Field>Private note</Field>
    </Form>
  );
};
