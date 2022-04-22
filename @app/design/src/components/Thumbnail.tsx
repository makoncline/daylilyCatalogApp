import styled from "styled-components";

export const Thumbnail = styled.div`
  position: relative;
  width: 100px;
  aspect-ratio: 1;
`;

export const thumbnailProps: {
  layout: "fixed" | "fill" | "intrinsic" | "responsive" | undefined;
  objectFit: "cover" | "contain" | "fill" | "none" | undefined;
} = { layout: "fill", objectFit: "cover" };
