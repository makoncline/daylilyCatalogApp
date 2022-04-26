import { ApolloError, useApolloClient } from "@apollo/client";
import {
  ListInput,
  RegisteredLilyDisplay,
  RegisteredLilyInput,
} from "@app/components";
import {
  Button,
  Field,
  Form,
  FormError,
  FormGroup,
  FormStateContextProps,
  FormWrapper,
  Heading,
  Space,
  SubmitButton,
  useForm,
} from "@app/design";
import {
  AhsSearchDataFragment,
  ListDataFragment,
  useDeleteLilyMutation,
  useDeleteUploadMutation,
  useEditLilyMutation,
  useLilyByIdQuery,
} from "@app/graphql";
import {
  catalogUrl,
  extractError,
  getCodeFromError,
  resetWebsocketConnection,
  toViewListingUrl,
} from "@app/lib";
import AmazonS3URI from "amazon-s3-uri";
import { UseComboboxStateChange } from "downshift";
import Router from "next/router";
import React, { useCallback } from "react";
import styled from "styled-components";

import { ImageDisplay } from "../../ImageDisplay";
import { ImageUpload } from "../../ImageUpload";

type EditListingFormProps = {
  error: Error | ApolloError | null;
  setError: (error: Error | ApolloError | null) => void;
  id: number;
};

function EditListingForm({ error, setError, id }: EditListingFormProps) {
  const [formState, setFormState] = React.useState<"idle" | "deleting">("idle");
  const [linkedLily, setLinkedLily] =
    React.useState<AhsSearchDataFragment | null>(null);
  const [list, setList] = React.useState<ListDataFragment | null>(null);
  const {
    data,
    loading,
    error: queryError,
  } = useLilyByIdQuery({ variables: { id } });
  const client = useApolloClient();
  const [editLily] = useEditLilyMutation();
  const [deleteLily] = useDeleteLilyMutation();
  const formId = "edit-listing-form";
  const { values, isReady, setValues } = useForm(formId);
  const handleSubmit = useCallback(
    async ({ values }: FormStateContextProps) => {
      setError(null);
      const { name, price, publicNote, privateNote } = values;
      try {
        const { data } = await editLily({
          variables: {
            id: id,
            name: name,
            price: parseInt(price) || null,
            publicNote: publicNote,
            privateNote: privateNote,
            ahsId: linkedLily?.ahsId.toString() || null,
            listId: list?.id,
          },
        });
        // Success: refetch
        resetWebsocketConnection();
        client.resetStore();
        const lily = data?.updateLily?.lily;
        if (lily) {
          Router.push(toViewListingUrl(lily.id));
        }
      } catch (e: any) {
        setError(e);
      }
    },
    [client, editLily, id, linkedLily, list, setError]
  );
  const [deleteUpload] = useDeleteUploadMutation();
  async function handleDeleteImage(imageUrl: string) {
    const { key } = AmazonS3URI(imageUrl);
    try {
      await deleteUpload({
        variables: {
          input: {
            key: key!!,
          },
        },
      });
    } catch (err) {
      console.log(`Error deleting file: `, key, " at url: ", imageUrl);
      throw err;
    }
  }
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this listing?")) {
      setFormState("deleting");
      try {
        if (imageUrls) {
          for (const imgUrl of imageUrls) {
            await handleDeleteImage(imgUrl);
          }
        }
        await deleteLily({ variables: { id } });
        setFormState("idle");
        resetWebsocketConnection();
        client.resetStore();
        Router.push(catalogUrl);
      } catch (e: any) {
        setError(e);
      }
    }
  };
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

  const handleListChange = ({
    selectedItem,
  }: UseComboboxStateChange<ListDataFragment>): void => {
    setList(selectedItem || null);
  };

  const handleUnlink = () => {
    setLinkedLily(null);
  };

  const handleRemoveFromList = () => {
    setList(null);
  };

  React.useEffect(() => {
    if (!isReady && data?.lily) {
      const {
        name,
        price,
        publicNote,
        privateNote,
        ahsDatumByAhsRef,
        list,
        imgUrl,
      } = data.lily;
      const priceInt = parseInt(price);
      const priceString = priceInt ? priceInt.toString() : "";
      setValues({
        name: name,
        price: priceString,
        publicNote: publicNote || "",
        privateNote: privateNote || "",
      });
      if (ahsDatumByAhsRef) {
        setLinkedLily(ahsDatumByAhsRef);
      }
      if (list) {
        setList(list);
      }
      if (imgUrl) {
        setImageUrls(imgUrl.filter(Boolean) as string[]);
      }
    }
  }, [data, isReady, setValues]);

  const MAX_NUM_IMAGES = 3;
  const [imageUrls, setImageUrls] = React.useState<string[] | null>([]);
  const numImages = imageUrls?.length ?? 0;
  const showImageUpload = numImages < MAX_NUM_IMAGES;
  const handleBeforeUpload = React.useCallback(
    (files: File[]) => {
      const newNumImages = numImages + files.length;
      console.log("i", numImages, newNumImages);
      if (newNumImages > MAX_NUM_IMAGES) {
        alert(
          `Only ${MAX_NUM_IMAGES} images allowed per listing. Please remove ${
            newNumImages - MAX_NUM_IMAGES
          } images and try again.`
        );
        return false;
      }
      return true;
    },
    [numImages]
  );

  const handleImageUploaded = React.useCallback((_key: string, url: string) => {
    setImageUrls((prev) => [...(prev ?? []), url]);
  }, []);
  React.useEffect(() => {
    if (
      isReady &&
      imageUrls &&
      JSON.stringify(imageUrls) != JSON.stringify(data?.lily?.imgUrl)
    ) {
      try {
        editLily({
          variables: {
            id: id,
            imgUrl: imageUrls,
          },
        });
        console.log("saved img urls to db: ", imageUrls);
      } catch (e: any) {
        setError(e);
      }
    }
  }, [data?.lily?.imgUrl, editLily, id, imageUrls, isReady, setError]);

  if (loading) return <p>Loading...</p>;
  if (queryError) return <p>Error: {queryError.message}</p>;
  if (!data?.lily && formState === "deleting")
    return <p>Daylily with id {id} has been deleted</p>;
  if (!data?.lily) return <p>No listing found with id {id}</p>;
  return (
    <FormWrapper>
      <Form
        formId={formId}
        onSubmit={handleSubmit}
        validation={{
          name: (name: string) =>
            name.length === 0 ? "Please enter a name for this listing" : null,
          price: validatePrice,
        }}
      >
        {linkedLily ? (
          <details>
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
        <Field required={true}>Name</Field>
        <Field type="number" min="0" step="1">
          Price
        </Field>
        <Field textarea>Public note</Field>
        <Field textarea>Private note</Field>
        {list ? (
          <FormGroup>
            <label htmlFor="list">List</label>
            <FormGroup direction="row">
              <input
                id="list"
                name="list"
                type="text"
                value={list.name}
                disabled
                style={{ flexGrow: 1 }}
              />
              <Button
                onClick={handleRemoveFromList}
                disabled={formState === "deleting"}
              >
                Remove from list
              </Button>
            </FormGroup>
          </FormGroup>
        ) : (
          <ListInput onSelectedItemChange={handleListChange} />
        )}
        <Space direction="column" responsive>
          {showImageUpload ? (
            <ImageUpload
              keyPrefix="lily"
              title="Upload images"
              handleImageUploaded={handleImageUploaded}
              handleBeforeUpload={handleBeforeUpload}
            />
          ) : null}
          {imageUrls ? (
            <Space direction="column">
              <Heading level={3}>Listing images</Heading>
              <ImageDisplay imageUrls={imageUrls} setImageUrls={setImageUrls} />
            </Space>
          ) : null}
        </Space>
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
            <Button disabled={formState === "deleting"}>Save listing</Button>
          </SubmitButton>
          <Button onClick={handleDelete} disabled={formState === "deleting"}>
            Delete
          </Button>
        </FormGroup>
      </Form>
    </FormWrapper>
  );
}

export { EditListingForm };

const SummaryItems = styled.div`
  display: inline-grid;
  width: calc(100% - 2rem);
  grid-template: auto / auto auto;
  justify-content: space-between;
  align-items: center;
`;

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
