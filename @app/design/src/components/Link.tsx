import styled from "styled-components";

import { NavItem } from ".";

export const Link = styled.a`
  ${NavItem} & {
    color: var(--text-1);
    text-decoration: none;
    text-transform: uppercase;
    text-align: center;
    display: block;
    &:hover {
      color: var(--text-2);
      text-decoration: underline;
    }
  }
`;
