import React from "react";
import styled from "styled-components";

export function Thumbnail({
  children: child,
}: {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
}) {
  return (
    <StyledThumbnail>
      {React.cloneElement(child, thumbnailProps)}
    </StyledThumbnail>
  );
}

const StyledThumbnail = styled.div`
  position: relative;
  width: 100px;
  aspect-ratio: 1;
`;

export const thumbnailProps = {
  layout: "fill",
  objectFit: "cover",
  thumb: true,
};
