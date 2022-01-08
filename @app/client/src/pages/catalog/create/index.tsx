import { ApolloError, useApolloClient } from "@apollo/client";
import { ErrorAlert, Redirect, SharedLayout } from "@app/components";
import {
  Button,
  Field,
  Form,
  FormContextProps,
  FormError,
  FormGroup,
  SubmitButton,
} from "@app/design";
import { useAddLilyMutation, useSharedQuery } from "@app/graphql";
import {
  extractError,
  getCodeFromError,
  resetWebsocketConnection,
} from "@app/lib";
import { NextPage } from "next";
import Router from "next/router";
import React, { useCallback, useState } from "react";

const Create: NextPage = () => {
  const query = useSharedQuery();
  const [error, setError] = useState<Error | ApolloError | null>(null);
  const {
    data: sharedQueryData,
    loading: sharedQueryLoading,
    error: sharedQueryError,
  } = query;

  return (
    <SharedLayout title="Create" query={query}>
      {sharedQueryData?.currentUser ? (
        <NewAddLilyForm error={error} setError={setError} />
      ) : sharedQueryLoading ? (
        "Loading..."
      ) : sharedQueryError ? (
        <ErrorAlert error={sharedQueryError} />
      ) : (
        <Redirect href={`/login?next=${encodeURIComponent("/")}`} />
      )}
    </SharedLayout>
  );
};

export default Create;

type NewAddLilyFormProps = {
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
};

function NewAddLilyForm({ error, setError }: NewAddLilyFormProps) {
  const client = useApolloClient();
  const [addLily] = useAddLilyMutation();
  const handleSubmit = useCallback(
    async ({ values }: FormContextProps) => {
      console.log(values);
      setError(null);
      const { name, price, publicNote, privateNote } = values;
      if (
        typeof name !== "string" ||
        typeof price !== "string" ||
        typeof publicNote !== "string" ||
        typeof privateNote !== "string"
      ) {
        setError(new Error("Invalid data"));
        return;
      }
      try {
        const { data } = await addLily({
          variables: {
            name: name,
            price: price ? parseInt(price) : null,
            publicNote: publicNote,
            privateNote: privateNote,
          },
        });
        // Success: refetch
        resetWebsocketConnection();
        client.resetStore();
        const lily = data?.createLily?.lily;
        if (lily) {
          // Router.push(`/listings/${lily.id}`);
          Router.push(`/catalog`);
        }
      } catch (e: any) {
        setError(e);
      }
    },
    [addLily, client, setError]
  );
  const code = getCodeFromError(error);
  return (
    <Form
      onSubmit={handleSubmit}
      validation={{
        name: (name: string) =>
          name.length === 0 ? "Please enter a name for this listing" : null,
        price: validatePrice,
      }}
    >
      <Field required={true}>Name</Field>
      <Field type="number" min="0" step="1">
        Price
      </Field>
      <Field>Public note</Field>
      <Field>Private note</Field>
      {error ? (
        <FormGroup>
          <FormError>
            <p>Create listing failed</p>
            <span>
              {extractError(error).message}
              {code ? (
                <span>
                  {" "}
                  (Error code: <code>ERR_{code}</code>)
                </span>
              ) : null}
            </span>
          </FormError>
        </FormGroup>
      ) : null}
      <FormGroup direction="row">
        <SubmitButton>
          <Button>Create listing</Button>
        </SubmitButton>
      </FormGroup>
    </Form>
  );
}

const validatePrice = (price: string) => {
  if (parseInt(price) <= 0) {
    return "Price must be greater than 0";
  } else if (price.includes(".")) {
    return "Price must be a whole number";
  } else if (price && isNaN(parseInt(price))) {
    return "Price must be a number";
  } else {
    return null;
  }
};
