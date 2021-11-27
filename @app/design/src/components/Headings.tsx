import React from "react";
import styled from "styled-components";

import { Hr, Nav } from ".";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const Heading = ({
  level,
  children,
  ...rest
}: {
  level: HeadingLevel;
  children: React.ReactNode;
}) => (
  <StyledHeading as={`h${level}`} {...rest}>
    {children}
  </StyledHeading>
);

const FancyHeadingComponent = ({
  level,
  children,
  ...rest
}: {
  level: HeadingLevel;
  children: React.ReactNode;
}) => (
  <Heading level={level} {...rest}>
    <span>{children}</span>
    <Hr />
  </Heading>
);

const StyledHeading = styled.h1`
  color: var(--color-txt);
  ${Nav as any} & {
    margin: 0;
  }
`;

export const FancyHeading = styled(FancyHeadingComponent)`
  background: var(--color-bg--sheet);
  display: grid;
  grid-template: auto / auto;
  width: 100%;
  text-align: center;
  span {
    grid-area: 1 / 1;
    background: inherit;
    margin: auto;
    z-index: 1;
    padding: 0 var(--spacing-md);
  }
`;
