import React from "react";
import styled from "styled-components";

import { below } from "../utilities";

export const Card = ({
  size,
  gridTemplate,
  sizeProp = "width",
  children,
  ...rest
}: {
  size?: string;
  gridTemplate?: string;
  sizeProp?: "width" | "height";
  children: React.ReactNode;
}) => {
  const gridTemplateDefault =
    sizeProp === "height"
      ? `1fr / ${size || "1fr"} 1fr`
      : `${size || "1fr"} 1fr / 1fr`;
  return (
    <>
      <CardWrapper
        style={
          {
            "--size": size,
            "--width": sizeProp === "width" ? size : "",
            "--height": sizeProp === "height" ? size : "",
            "--grid-template": gridTemplate || gridTemplateDefault,
          } as React.CSSProperties
        }
        {...rest}
      >
        {children}
      </CardWrapper>
    </>
  );
};

const Body = ({ children, ...rest }: { children: React.ReactNode }) => {
  return <BodyWrapper {...rest}>{children}</BodyWrapper>;
};
Card.Body = Body;

const Image = ({ children, ...rest }: { children: React.ReactNode }) => {
  return <ImageWrapper {...rest}>{children}</ImageWrapper>;
};
Card.Image = Image;

const CardWrapper = styled.article`
  width: var(--width, unset);
  height: var(--height, 100%);
  display: grid;
  grid-template: var(--grid-template);
  border-radius: var(--border-radius);
  overflow: hidden;
  cursor: pointer;
  &:hover {
    background: var(--color-bg--secondary-glint);
  }
  ${below.md`
    grid-template: var(--size, 1fr) 1fr / 1fr;
    height: unset;
  `}
`;

const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  img {
    object-position: center;
    object-fit: cover;
  }
`;

const BodyWrapper = styled.div`
  margin: var(--container-padding);
`;
