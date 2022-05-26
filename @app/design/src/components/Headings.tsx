import React from "react";
import styled from "styled-components";

import { below, breakAll } from "../utilities";
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

  ${breakAll}

  span {
    grid-area: 1 / 1;
    background: inherit;
    margin: auto;
    z-index: 1;
    padding: 0 var(--size-3);
  }
  ${below.sm`
    :is(h1) {
      font-size: var(--font-size-5);
    }
    :is(h2) {
      font-size: var(--font-size-4);
    }
    :is(h3) {
      font-size: var(--font-size-3);
    }
    :is(h4) {
      font-size: var(--font-size-2);
    }
    :is(h5, h6) {
      font-size: var(--font-size-1);
    }
  `}
`;
