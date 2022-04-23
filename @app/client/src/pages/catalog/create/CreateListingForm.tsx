import { ApolloError, useApolloClient } from "@apollo/client";
import { RegisteredLilyDisplay, RegisteredLilyInput } from "@app/components";
import {
  Button,
  Field,
  Form,
  FormError,
  FormGroup,
  FormStateContextProps,
  FormWrapper,
  SubmitButton,
  useForm,
} from "@app/design";
import { AhsSearchDataFragment, useAddLilyMutation } from "@app/graphql";
import {
  extractError,
  getCodeFromError,
  resetWebsocketConnection,
  toEditListingUrl,
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
  const { values, setValues } = useForm("create-listing-form");
  const [linkedLily, setLinkedLily] =
    React.useState<AhsSearchDataFragment | null>(null);
  const client = useApolloClient();
  const [addLily] = useAddLilyMutation();
  const handleSubmit = useCallback(
    async ({ values }: FormStateContextProps) => {
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
          Router.push(toEditListingUrl(lily.id));
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
    if (!values?.name && selectedItem?.name) {
      setValues({
        name: selectedItem.name,
      });
    }
  };

  const handleUnlink = () => {
    setLinkedLily(null);
  };

  return (
    <FormWrapper>
      <Form
        formId="create-listing-form"
        onSubmit={handleSubmit}
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
        <SubmitButton>
          <Button>Create listing</Button>
        </SubmitButton>
      </Form>
    </FormWrapper>
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
