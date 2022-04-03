import Image from "next/image";
import React from "react";
import styled from "styled-components";

function ImageDisplay({ imageUrls }: { imageUrls: string[] }) {
  const [imageIndex, setImageIndex] = React.useState(0);
  const imageUrl = imageUrls[imageIndex];
  return (
    <Wrapper>
      <DisplayImage>
        <Image
          src={imageUrl}
          alt={`listing photo`}
          layout="fill"
          objectFit="cover"
        />
      </DisplayImage>
      {imageUrls.map((url, i) => (
        <Thumbnail key={i}>
          <Image
            key={i}
            src={url}
            alt={`listing photo ${i}`}
            layout="fill"
            objectFit="cover"
            onClick={() => setImageIndex(i)}
          />
        </Thumbnail>
      ))}
    </Wrapper>
  );
}

export { ImageDisplay };

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: var(--size-image) var(--size-image-thumbnail);
  grid-template-columns: repeat(4, var(--size-image-thumbnail));
  gap: var(--size-1);
`;
const DisplayImage = styled.div`
  position: relative;
  grid-column: span 4;
`;
const Thumbnail = styled.div`
  position: relative;
`;
