import React from "react";
import styled from "styled-components";

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
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: var(--color-text-light-primary);
  font-family: -system-ui, sans-serif;
  font-size: var(--font-size-button);
  line-height: 1.2;
  white-space: nowrap;
  text-decoration: none;
  padding: var(--spacing-xs) var(--spacing-md);
  cursor: pointer;
  &:hover {
    background: var(--color-primary-light);
    border-color: var(--color-primary-light);
    color: var(--color-text-light-secondary);
  }
`;

export const IconButton = styled(Button)`
  background: transparent;
  border-color: transparent;
  color: var(--color-text-primary);
  width: var(--size-12);
  height: var(--size-12);
  font-size: var(--h4);
  padding: 0;
  &:hover {
    background: transparent;
    border-color: transparent;
    color: var(--color-text-secondary);
  }
`;
