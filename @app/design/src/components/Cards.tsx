import React from "react";
import styled from "styled-components";

import { absolute, elevation } from "../utilities";

export const Card = ({
  size,
  gridTemplate,
  fitHeight,
  children,
  ...rest
}: {
  size?: string;
  gridTemplate?: string;
  fitHeight?: boolean;
  children: React.ReactNode;
}) => {
  const CardComponent = fitHeight ? StyledCardConstrainedHeight : StyledCard;
  return (
    <>
      <CardComponent
        style={
          {
            "--size": size,
            "--grid-template": gridTemplate,
          } as React.CSSProperties
        }
        {...rest}
      >
        {children}
      </CardComponent>
    </>
  );
};

const Body = ({ children, ...rest }: { children: React.ReactNode }) => {
  return <StyledCardBody {...rest}>{children}</StyledCardBody>;
};
Card.Body = Body;

const Image = ({
  fitHeight,
  children,
  ...rest
}: {
  fitHeight?: boolean;
  children: React.ReactNode;
}) => {
  const ImageComponent = fitHeight ? StyledImageFitHeight : StyledImage;
  return <ImageComponent {...rest}>{children}</ImageComponent>;
};
Card.Image = Image;

const StyledCard = styled.article`
  width: var(--size, 100%);
  display: grid;
  grid-template-rows: var(--grid-template, none);
  background: var(--color-card-bg);
  border-radius: var(--border-radius);
  margin: var(--spacing-md);
  overflow: hidden;
  cursor: pointer;
  ${elevation[3]}
`;

const StyledCardConstrainedHeight = styled(StyledCard)`
  width: 100%;
  height: var(--size, 100%);
  grid-template-rows: unset;
  grid-template-columns: var(--grid-template, 1fr 1fr);
`;

const StyledImage = styled.div`
  width: 100%;
  height: 0;
  padding-top: 100%;
  position: relative;
  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
    ${absolute({ x: 0, y: 0 })}
    vertical-align: top;
  }
  .fit-height {
  }
`;

const StyledImageFitHeight = styled(StyledImage)`
  padding-top: unset;
  height: 100%;
  width: 0;
  padding-left: 100%;
`;

const StyledCardBody = styled.div`
  margin: var(--spacing-md);
`;
