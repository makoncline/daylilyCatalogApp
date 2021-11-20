import React from "react";
import styled from "styled-components";

import { Nav } from ".";

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

const StyledHeading = styled.h1`
  ${Nav as any} & {
    margin: 0;
  }
`;
