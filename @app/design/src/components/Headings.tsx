import React from "react";
import styled from "styled-components";

import { Hr } from ".";
import { Wrapper as NavWrapper } from "./Nav";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const Heading = ({
  level,
  children,
  ...props
}: {
  level: HeadingLevel;
  children: React.ReactNode;
  [props: string]: unknown;
}) => (
  <StyledHeading as={`h${level}`} {...props}>
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
  color: var(--text-1);
  max-inline-size: unset;
  ${NavWrapper} & {
    margin: 0;
  }
`;

export const FancyHeading = styled(FancyHeadingComponent)`
  background: var(--surface-1);
  display: grid;
  grid-template: auto / auto;
  width: 100%;
  text-align: center;
  span {
    grid-area: 1 / 1;
    background: inherit;
    margin: auto;
    z-index: 1;
    padding: 0 var(--size-3);
  }
`;
