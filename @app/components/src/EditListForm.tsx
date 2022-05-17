import {
  Alert,
  Button,
  Field,
  Form,
  FormWrapper,
  Space,
  SubmitButton,
  useForm,
} from "@app/design";
import {
  ListDataFragment,
  useDeleteListMutation,
  useUpdateListMutation,
} from "@app/graphql";
import * as Sentry from "@sentry/nextjs";
import Router from "next/router";
import React from "react";

function EditListForm({ list }: { list: ListDataFragment }) {
  const editListFormName = "edit-list";
  const { values, setValues } = useForm(editListFormName);
  const [editList] = useUpdateListMutation();
  const [deleteList] = useDeleteListMutation();
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    setValues({
      name: list.name,
      description: list.intro || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  async function handleSubmit() {
    try {
      await editList({
        variables: {
          id: list.id,
          patch: {
            name: values.name,
            intro: values.description,
          },
        },
      });
      Router.push(`/lists`);
    } catch (e: any) {
      Sentry.captureException(e);
      setError(e.message);
    }
  }

  async function handleDelete() {
    try {
      confirm("Are you sure you want to delete this list?");
      await deleteList({
        variables: {
          id: list.id,
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
      <Form formId={editListFormName} onSubmit={handleSubmit}>
        <Field>Name</Field>
        <Field textarea>Description</Field>
        <Space block>
          <SubmitButton>
            <Button block>Update list</Button>
          </SubmitButton>
          <Button onClick={handleDelete} danger>
            Delete list
          </Button>
        </Space>
      </Form>
      {error && (
        <Alert type="danger">
          <Alert.Heading>Error updating list</Alert.Heading>
          <Alert.Body>{error.message}</Alert.Body>
        </Alert>
      )}
    </FormWrapper>
  );
}

export { EditListForm };
