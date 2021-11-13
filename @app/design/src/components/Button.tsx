import React from "react";
import styled from "styled-components";

import { elevation } from "../utilities";
type Props = {
  children: React.ReactNode;
  href?: string;
} & (
  | React.ButtonHTMLAttributes<HTMLButtonElement>
  | React.AnchorHTMLAttributes<HTMLAnchorElement>
);

export const Button = ({ children, href, ...other }: Props) => {
  const isLink = typeof href === "string";
  return (
    <>
      {isLink ? (
        <StyledLink
          href={href}
          {...(other as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </StyledLink>
      ) : (
        <StyledButton
          {...(other as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {children}
        </StyledButton>
      )}
    </>
  );
};

const StyledLink = styled.a``;
const StyledButton = styled.button`
  color: var(--color, var(--color-button-text));
  background: var(--background, var(--color-button-bg));
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius);
  font-size: var(--font-size-button);
  border: none;
  transition: 0.3s ease box-shadow;
  display: grid;
  justify-content: center;
  align-items: center;
  ${elevation[1]};
  &:hover {
    ${elevation[2]};
  }
`;

// export const IconButton = styled(Button)`
//   background: transparent;
//   box-shadow: none;
//   width: var(--size-12);
//   height: var(--size-12);
//   padding: 0;
//   &:hover {
//     box-shadow: none;
//   }
// `;
