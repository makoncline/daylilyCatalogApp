import {
  Alert,
  Button,
  Field,
  Form,
  FormWrapper,
  Heading,
  SubmitButton,
  useForm,
} from "@app/design";
import { useAddListMutation } from "@app/graphql";
import * as Sentry from "@sentry/nextjs";
import Router from "next/router";
import React from "react";

function CreateListForm() {
  const createListFormName = "create-list";
  const { values } = useForm(createListFormName);
  const [addList] = useAddListMutation();
  const [error, setError] = React.useState<Error | null>(null);
  async function handleSubmit() {
    try {
      await addList({
        variables: {
          name: values.name,
          intro: values.description,
        },
      });
      Router.push(`/lists`);
    } catch (e: any) {
      Sentry.captureException(e);
      setError(e.message);
    }
  }
  return (
    <FormWrapper>
      <Heading level={2}>Create List</Heading>
      <Form
        formId={createListFormName}
        onSubmit={handleSubmit}
        validation={{
          name: (name: string) => (name.length ? null : "name is required"),
        }}
      >
        <Field required>Name</Field>
        <Field textarea maxLength={279}>
          Description
        </Field>
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
    </FormWrapper>
  );
}

export { CreateListForm };
