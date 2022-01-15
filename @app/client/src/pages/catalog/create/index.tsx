import { ApolloError, useApolloClient } from "@apollo/client";
import {
  ErrorAlert,
  ListInput,
  Redirect,
  RegisteredLilyDisplay,
  RegisteredLilyInput,
  SharedLayout,
} from "@app/components";
import {
  Button,
  Field,
  Form,
  FormContextProps,
  FormError,
  FormGroup,
  SubmitButton,
} from "@app/design";
import {
  AhsSearchDataFragment,
  ListDataFragment,
  useAddLilyMutation,
  useSharedQuery,
} from "@app/graphql";
import {
  extractError,
  getCodeFromError,
  resetWebsocketConnection,
} from "@app/lib";
import { UseComboboxStateChange } from "downshift";
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
  const [linkedLily, setLinkedLily] =
    React.useState<AhsSearchDataFragment | null>(null);
  const [list, setList] = React.useState<ListDataFragment | null>(null);
  const client = useApolloClient();
  const [addLily] = useAddLilyMutation();
  const handleSubmit = useCallback(
    async ({ values }: FormContextProps) => {
      setError(null);
      const { name, price, publicNote, privateNote } = values;
      try {
        const { data } = await addLily({
          variables: {
            name: name,
            price: price ? parseInt(price) : null,
            publicNote: publicNote,
            privateNote: privateNote,
            ahsId: linkedLily ? linkedLily.ahsId.toString() : undefined,
            listId: list ? list.id : undefined,
          },
        });
        // Success: refetch
        resetWebsocketConnection();
        client.resetStore();
        const lily = data?.createLily?.lily;
        console.log("Created lily:", lily);
        if (lily) {
          // Router.push(`/listings/${lily.id}`);
          Router.push(`/catalog`);
        }
      } catch (e: any) {
        setError(e);
      }
    },
    [addLily, client, linkedLily, list, setError]
  );
  const code = getCodeFromError(error);

  const handleLinkedLilyChange = ({
    selectedItem,
  }: UseComboboxStateChange<AhsSearchDataFragment>): void => {
    setLinkedLily(selectedItem || null);
    // if name is not set, set it to the name of the linked lily
    if (!formValues?.name) {
      setFormValues((prevValues) => ({
        ...prevValues,
        name: selectedItem?.name || "",
      }));
    }
  };

  const handleListChange = ({
    selectedItem,
  }: UseComboboxStateChange<ListDataFragment>): void => {
    setList(selectedItem || null);
  };

  const handleUnlink = () => {
    setLinkedLily(null);
  };

  let formValues: FormContextProps["values"];
  let setFormValues: FormContextProps["setValues"];

  const handleFormValuesChange: ({
    values,
    setValues,
  }: Pick<FormContextProps, "values" | "setValues">) => void = ({
    values,
    setValues,
  }) => {
    setFormValues = setValues;
    formValues = values;
  };

  return (
    <Form
      onSubmit={handleSubmit}
      onValuesChange={handleFormValuesChange}
      validation={{
        name: (name: string) =>
          name.length === 0 ? "Please enter a name for this listing" : null,
        price: validatePrice,
      }}
    >
      {linkedLily ? (
        <>
          <RegisteredLilyDisplay ahsId={linkedLily.ahsId} />
          <Button onClick={handleUnlink}>Unlink</Button>
        </>
      ) : (
        <RegisteredLilyInput onSelectedItemChange={handleLinkedLilyChange} />
      )}
      <Field required={true}>Name</Field>
      <Field type="number" min="0" step="1">
        Price
      </Field>
      <Field>Public note</Field>
      <Field>Private note</Field>
      <ListInput onSelectedItemChange={handleListChange} />
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
