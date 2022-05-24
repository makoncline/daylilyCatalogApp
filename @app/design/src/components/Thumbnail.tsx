import React from "react";
import styled from "styled-components";

export function Thumbnail({
  children: child,
  thumb = true,
  ...props
}: {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  thumb?: boolean;
  [key: string]: any;
}) {
  return (
    <StyledThumbnail {...props}>
      {React.cloneElement(child, {
        ...thumbnailProps,
        thumb,
        sizes: thumb ? "200px" : "100vw",
      })}
    </StyledThumbnail>
  );
}

const StyledThumbnail = styled.div`
  position: relative;
  width: var(--width, 100px);
  max-width: var(--size-image);
  height: var(--width, 100px);
  max-height: var(--size-image);
  aspect-ratio: 1;
`;

export const thumbnailProps = {
  layout: "fill",
  objectFit: "cover",
};
