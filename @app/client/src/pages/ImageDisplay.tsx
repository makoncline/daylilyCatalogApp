import { Button } from "@app/design";
import Image from "next/image";
import React from "react";
import styled from "styled-components";

type ImageDisplayProps = {
  imageUrls: string[];
  setImageUrls: (imageUrls: string[]) => void;
};
function ImageDisplay({ imageUrls, setImageUrls }: ImageDisplayProps) {
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

  return (
    <Wrapper>
      {imageUrls.map((url, i) => (
        <ImageDisplayItem key={i}>
          <ImageWrapper>
            <Image src={url} layout="fill" objectFit="cover" />
          </ImageWrapper>
          <ControlsWrapper>
            <Button onClick={() => handleMove("<", i)}>{"<"}</Button>
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
  grid-template-columns: 1fr 1fr;
  gap: var(--size-1);
`;
const ImageDisplayItem = styled.div``;
