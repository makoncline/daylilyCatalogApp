import { Button, Thumbnail, thumbnailProps } from "@app/design";
import { useDeleteUploadMutation } from "@app/graphql";
import * as Sentry from "@sentry/nextjs";
import AmazonS3URI from "amazon-s3-uri";
import Image from "next/image";
import React from "react";
import styled from "styled-components";

type ImageDisplayProps = {
  imageUrls: string[];
  setImageUrls: (imageUrls: string[]) => void;
};

function ImageDisplay({ imageUrls, setImageUrls }: ImageDisplayProps) {
  const [deleteUpload] = useDeleteUploadMutation();
  const [showControls, setShowControls] = React.useState(false);
  function handleMove(direction: "<" | ">", index: number) {
    const newImageUrls = [...imageUrls];
    const [moved] = newImageUrls.splice(index, 1);
    if (direction === "<") {
      newImageUrls.splice(index - 1, 0, moved);
    } else {
      newImageUrls.splice(index + 1, 0, moved);
    }
    setImageUrls(newImageUrls);
  }
  async function handleDelete(index: number) {
    if (confirm("Are you sure you want to delete this image?")) {
      const url = imageUrls[index];
      const { key } = AmazonS3URI(url);
      try {
        await deleteUpload({
          variables: {
            input: {
              key: key!!,
            },
          },
        });
        setImageUrls(imageUrls.filter((_, i) => i !== index));
      } catch (err) {
        console.log(`Error deleting file: `, key, " at url: ", url);
        Sentry.captureException(err);
        throw err;
      }
    }
  }
  const hasMultipleImages = imageUrls.length > 1;
  function handleShowControls() {
    setShowControls((prev) => !prev);
  }
  return (
    <>
      {imageUrls.length > 0 && (
        <>
          <Wrapper>
            {imageUrls.map((url, i) => (
              <ImageDisplayItem key={i}>
                <Thumbnail>
                  <Image src={url} {...thumbnailProps} />
                </Thumbnail>
                {showControls && (
                  <ControlsWrapper>
                    {hasMultipleImages && (
                      <Button onClick={() => handleMove("<", i)}>{"<"}</Button>
                    )}
                    <Button onClick={() => handleDelete(i)}>&times;</Button>
                    {hasMultipleImages && (
                      <Button onClick={() => handleMove(">", i)}>{">"}</Button>
                    )}
                  </ControlsWrapper>
                )}
              </ImageDisplayItem>
            ))}
          </Wrapper>
          <div>
            {!showControls ? (
              <Button onClick={handleShowControls}>
                {`Edit image${imageUrls.length > 1 ? "s" : ""}`}
              </Button>
            ) : (
              <Button onClick={handleShowControls}>
                {`Done editing image${imageUrls.length > 1 ? "s" : ""}`}
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
}

export { ImageDisplay as ImageDisplay };

const Wrapper = styled.div`
  width: 100%;
  display: grid;
  grid-auto-columns: 100px;
  grid-auto-flow: column;
  gap: var(--size-1);
`;

const ControlsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-flow: column;
  gap: var(--size-1);
  button {
    padding-left: 0;
    padding-right: 0;
  }
`;
const ImageDisplayItem = styled.div``;
