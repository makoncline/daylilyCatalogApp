import {
  Alert,
  Button,
  Field,
  Form,
  Heading,
  SubmitButton,
  useForm,
} from "@app/design";
import { useAddListMutation } from "@app/graphql";
import Router from "next/router";
import React from "react";
import styled from "styled-components";

function CreateListForm() {
  const createListFormName = "create-list";
  const { values } = useForm(createListFormName);
  const [addList] = useAddListMutation();
  const [error, setError] = React.useState<Error | null>(null);
  async function handleSubmit() {
    try {
      console.log(values);
      await addList({
        variables: {
          name: values.name,
          intro: values.description,
        },
      });
      Router.push(`/lists`);
    } catch (e: any) {
      setError(e.message);
    }
  }
  return (
    <Wrapper>
      <Heading level={2}>Create List</Heading>
      <Form formId={createListFormName} onSubmit={handleSubmit}>
        <Field>Name</Field>
        <Field>Description</Field>
        <SubmitButton>
          <Button>Create list</Button>
        </SubmitButton>
      </Form>
      {error && (
        <Alert type="danger">
          <Alert.Heading>Error creating list</Alert.Heading>
          <Alert.Body>{error.message}</Alert.Body>
        </Alert>
      )}
    </Wrapper>
  );
}

export { CreateListForm };

const Wrapper = styled.div``;
