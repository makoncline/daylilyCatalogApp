import React from "react";
import styled from "styled-components";

import { Navigation } from ".";

type Props = {
  children: React.ReactNode;
  href?: string;
} & (
  | React.InputHTMLAttributes<HTMLInputElement>
  | React.ButtonHTMLAttributes<HTMLButtonElement>
);

export const Button = ({ children, href, ...other }: Props) => {
  const isLink = typeof href === "string";
  return (
    <>
      {isLink ? (
        <form style={{ display: "inline" }} action={href} method="get">
          <StyledButton
            type="submit"
            value={children as string}
            {...(other as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        </form>
      ) : (
        <StyledButton
          as={"button"}
          {...(other as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {children}
        </StyledButton>
      )}
    </>
  );
};

const StyledButton = styled.input`
  border: 0;
  border-radius: 0.25rem;
  background: var(--background, var(--color-button-bg));
  color: var(--color, var(--color-button-text));
  font-family: -system-ui, sans-serif;
  font-size: var(--font-size-button);
  line-height: 1.2;
  white-space: nowrap;
  text-decoration: none;
  padding: var(--spacing-xs) var(--spacing-sm);
  margin: var(--spacing-xs);
  cursor: pointer;
`;

export const IconButton = styled(Button)`
  background: transparent;
  width: var(--size-12);
  height: var(--size-12);
  font-size: var(--h4);
  padding: 0;
  color: var(--color, var(--color-text));
  &:hover {
    color: var(--color-hover, var(--color-text-light));
  }
  ${Navigation as any} {
    color: var(--color-nav-text);
    &:hover {
      color: var(--color-nav-text-light);
    }
  }
`;
