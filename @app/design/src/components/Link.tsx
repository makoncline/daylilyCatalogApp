import React from "react";
import styled from "styled-components";

import { NavItem } from ".";

export const Link = ({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) => {
  return <StyledLink href={href}>{children}</StyledLink>;
};
const StyledLink = styled.a`
  ${NavItem as any} & {
    color: var(--color-txt);
    text-decoration: none;
    text-transform: uppercase;
    text-align: center;
    display: block;
    &:hover {
      color: var(--color-txt--subtle);
      text-decoration: underline;
    }
  }
`;
