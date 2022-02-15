import { ApolloError, useApolloClient } from "@apollo/client";
import { RegisteredLilyDisplay, RegisteredLilyInput } from "@app/components";
import {
  Button,
  Field,
  Form,
  FormContextProps,
  FormError,
  FormGroup,
  SubmitButton,
} from "@app/design";
import { AhsSearchDataFragment, useAddLilyMutation } from "@app/graphql";
import {
  extractError,
  getCodeFromError,
  resetWebsocketConnection,
} from "@app/lib";
import { UseComboboxStateChange } from "downshift";
import Router from "next/router";
import React, { useCallback } from "react";
import styled from "styled-components";

type EditListingFormProps = {
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
};

function CreateListingForm({ error, setError }: EditListingFormProps) {
  const [linkedLily, setLinkedLily] =
    React.useState<AhsSearchDataFragment | null>(null);
  const client = useApolloClient();
  const [addLily] = useAddLilyMutation();
  const handleSubmit = useCallback(
    async ({ values }: FormContextProps) => {
      setError(null);
      const { name } = values;
      try {
        const { data } = await addLily({
          variables: {
            name: name,
            ahsId: linkedLily ? linkedLily.ahsId.toString() : undefined,
          },
        });
        // Success: refetch
        resetWebsocketConnection();
        client.resetStore();
        const lily = data?.createLily?.lily;
        console.log("Created lily:", lily);
        if (lily) {
          Router.push(`/catalog/edit/${lily.id}`);
        }
      } catch (e: any) {
        setError(e);
      }
    },
    [addLily, client, linkedLily, setError]
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
      }}
    >
      {linkedLily ? (
        <details open>
          <summary>
            <SummaryItems>
              Linked to {linkedLily?.name}
              <Button onClick={handleUnlink}>Unlink</Button>
            </SummaryItems>
          </summary>
          <RegisteredLilyDisplay ahsId={linkedLily.ahsId} />
        </details>
      ) : (
        <RegisteredLilyInput onSelectedItemChange={handleLinkedLilyChange} />
      )}
      <Field required={true} name="name">
        Listing Name
      </Field>
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

export { CreateListingForm };

const SummaryItems = styled.div`
  display: inline-grid;
  width: calc(100% - 2rem);
  grid-template: auto / auto auto;
  justify-content: space-between;
  align-items: center;
`;
