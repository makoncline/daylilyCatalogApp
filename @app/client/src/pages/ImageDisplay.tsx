import { Button } from "@app/design";
import { useDeleteUploadMutation } from "@app/graphql";
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
        throw err;
      }
    }
  }
  return (
    <Wrapper>
      {imageUrls.map((url, i) => (
        <ImageDisplayItem key={i}>
          <ImageWrapper>
            <Image src={url} layout="fill" objectFit="cover" />
          </ImageWrapper>
          <ControlsWrapper>
            <Button onClick={() => handleMove("<", i)}>{"<"}</Button>
            <Button onClick={() => handleDelete(i)}>&times;</Button>
            <Button onClick={() => handleMove(">", i)}>{">"}</Button>
          </ControlsWrapper>
        </ImageDisplayItem>
      ))}
    </Wrapper>
  );
}

export { ImageDisplay };

const Wrapper = styled.div`
  width: 300px;
  display: grid;
  grid-template-columns: repeat(3, 100px);
  gap: var(--size-1);
`;
const ImageWrapper = styled.div`
  position: relative;
  width: 100px;
  aspect-ratio: 1;
`;
const ControlsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--size-1);
  button {
    padding-left: 0;
    padding-right: 0;
  }
`;
const ImageDisplayItem = styled.div``;
