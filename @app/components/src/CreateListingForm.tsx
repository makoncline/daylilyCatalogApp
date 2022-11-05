import { ApolloError, useApolloClient } from "@apollo/client";
import {
  Alert,
  Button,
  Field,
  Form,
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
import * as Sentry from "@sentry/nextjs";
import { UseComboboxStateChange } from "downshift";
import Router from "next/router";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { RegisteredLilyDisplay } from "./RegisteredLilyDisplay";
import { RegisteredLilyInput } from "./RegisteredLilyInput";
import { SEO } from "./SEO";

function CreateListingForm() {
  const [error, setError] = useState<Error | ApolloError | null>(null);
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
        if (lily) {
          Router.push(toEditListingUrl(lily.id));
        }
      } catch (e: any) {
        setError(e);
        Sentry.captureException(e);
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
    <>
      <SEO
        title={`Create Listing`}
        description="Create a new listing in your Daylily Catalog. Add photos, description and pricing."
        noRobots
      />
      <FormWrapper>
        <Form
          formId="create-listing-form"
          onSubmit={handleSubmit}
          validation={{
            name: (name: string) =>
              name.length === 0 ? "Please enter a name for this listing" : null,
          }}
        >
          <FormGroup>
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
              <RegisteredLilyInput
                onSelectedItemChange={handleLinkedLilyChange}
              />
            )}
          </FormGroup>
          <Field required={true} name="name">
            Listing Name
          </Field>
          {error ? (
            <Alert type="danger">
              <Alert.Heading>Create listing failed</Alert.Heading>
              <Alert.Body>
                {extractError(error).message}
                {code ? (
                  <span>
                    {" "}
                    (Error code: <code>ERR_{code}</code>)
                  </span>
                ) : null}
              </Alert.Body>
            </Alert>
          ) : null}
          <SubmitButton>
            <Button block>Create listing</Button>
          </SubmitButton>
        </Form>
      </FormWrapper>
    </>
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
