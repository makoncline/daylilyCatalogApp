import React from "react";
import styled from "styled-components";

import { Image } from "./Image";

function ListingImageDisplay({ imageUrls }: { imageUrls: string[] }) {
  const [imageIndex, setImageIndex] = React.useState(0);
  const imageUrl = imageUrls[imageIndex];
  return (
    <Wrapper>
      <DisplayImage>
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={`listing photo`}
            layout="fill"
            objectFit="cover"
          />
        )}
      </DisplayImage>
      {imageUrls.length > 0 &&
        imageUrls.map((url, i) => (
          <Thumbnail key={i} selected={i === imageIndex}>
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

export { ListingImageDisplay };

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: min(var(--full-width), var(--size-image)) min(
      calc(var(--full-width) / 4),
      var(--size-image-thumbnail)
    );
  grid-template-columns: repeat(
    4,
    min(calc(var(--full-width) / 4), var(--size-image-thumbnail))
  );
`;
const DisplayImage = styled.div`
  position: relative;
  grid-column: span 4;
`;
const Thumbnail = styled.div<{ selected: boolean }>`
  position: relative;
  ${({ selected }) => (selected ? `border: var(--hairline);` : "")}
`;
