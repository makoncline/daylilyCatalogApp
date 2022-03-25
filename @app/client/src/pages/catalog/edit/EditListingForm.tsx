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
  SubmitButton,
  useForm,
} from "@app/design";
import {
  AhsSearchDataFragment,
  ListDataFragment,
  useEditLilyMutation,
  useLilyByIdQuery,
} from "@app/graphql";
import {
  extractError,
  getCodeFromError,
  resetWebsocketConnection,
} from "@app/lib";
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
  const { values, setValues, isReady } = useForm("edit-listing-form");
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
            ahsId: linkedLily?.ahsId.toString(),
            listId: list?.id,
          },
        });
        // Success: refetch
        resetWebsocketConnection();
        client.resetStore();
        const lily = data?.updateLily?.lily;
        if (lily) {
          Router.push(`/catalog`);
        }
      } catch (e: any) {
        setError(e);
      }
    },
    [client, editLily, id, linkedLily, list, setError]
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
  const [imageUrls, setImageUrls] = React.useState<string[]>([]);
  const showImageUpload = imageUrls.length < MAX_NUM_IMAGES;
  function handleBeforeUpload(files: File[]) {
    const newNumImages = imageUrls.length + files.length;
    if (newNumImages > MAX_NUM_IMAGES) {
      alert(
        `Only ${MAX_NUM_IMAGES} images allowed per listing. Please remove ${
          newNumImages - MAX_NUM_IMAGES
        } images and try again.`
      );
      return false;
    }
    return true;
  }
  const handleImageUploaded = React.useCallback((_key: string, url: string) => {
    setImageUrls((prev) => [...prev, url]);
  }, []);

  const saveImages = React.useCallback(async () => {
    try {
      await editLily({
        variables: {
          id: id,
          imgUrl: imageUrls,
        },
      });
    } catch (e: any) {
      setError(e);
    }
  }, [editLily, id, imageUrls, setError]);

  React.useEffect(() => {
    if (
      isReady &&
      JSON.stringify(imageUrls) != JSON.stringify(data?.lily?.imgUrl)
    ) {
      console.log("Saving images");
      console.log(imageUrls);
      console.log(data?.lily?.imgUrl);
      // saveImages();
    }
  }, [data?.lily?.imgUrl, imageUrls, loading, isReady, saveImages]);

  if (loading) return <p>Loading...</p>;
  if (queryError) return <p>Error: {queryError.message}</p>;
  return (
    <Form
      formId="edit-listing-form"
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
      <Field>Public note</Field>
      <Field>Private note</Field>
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
            <Button onClick={handleRemoveFromList}>Remove from list</Button>
          </FormGroup>
        </FormGroup>
      ) : (
        <ListInput onSelectedItemChange={handleListChange} />
      )}
      <div>
        {showImageUpload ? (
          <ImageUpload
            keyPrefix="lily"
            handleImageUploaded={handleImageUploaded}
            handleBeforeUpload={handleBeforeUpload}
          />
        ) : null}
        <ImageDisplay imageUrls={imageUrls} setImageUrls={setImageUrls} />
      </div>
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
          <Button>Save listing</Button>
        </SubmitButton>
      </FormGroup>
    </Form>
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