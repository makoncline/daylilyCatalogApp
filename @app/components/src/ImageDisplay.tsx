import { Button, Thumbnail } from "@app/design";
import * as Sentry from "@sentry/nextjs";
import React from "react";
import styled from "styled-components";

import { Image } from "./Image";
import { useRemoveUpload } from "./useRemoveUpload";

type ImageDisplayProps = {
  imageUrls: string[];
  setImageUrls: (imageUrls: string[]) => void | Promise<void>;
};

function ImageDisplay({ imageUrls, setImageUrls }: ImageDisplayProps) {
  const removeUpload = useRemoveUpload();
  const [error, setError] = React.useState<string | null>(null);
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
      setError(null);
      try {
        await removeUpload(url);
        await setImageUrls(imageUrls.filter((_, i) => i !== index));
      } catch (err) {
        Sentry.captureException(err);
        setError("The image could not be removed. Try again.");
      }
    }
  }
  const hasMultipleImages = imageUrls.length > 1;
  function handleShowControls() {
    setShowControls((prev) => !prev);
  }
  return (
    <>
      {error && <p role="alert">{error}</p>}
      {imageUrls.length > 0 && (
        <>
          <Wrapper>
            {imageUrls.map((url, i) => (
              <ImageDisplayItem key={url}>
                <Thumbnail>
                  <Image src={url} alt="Uploaded image" />
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
