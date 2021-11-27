import React from "react";
import styled from "styled-components";

import { above } from "../utilities";
import { Mobile } from "./";

type Props = {
  children: React.ReactNode;
  href?: string;
} & (
  | React.InputHTMLAttributes<HTMLInputElement>
  | React.ButtonHTMLAttributes<HTMLButtonElement>
);

export const Button = ({ children, href, ...rest }: Props) => {
  const isLink = typeof href === "string";
  return (
    <>
      {isLink ? (
        <form style={{ display: "inline" }} action={href} method="get">
          <StyledButton
            type="submit"
            value={children as string}
            {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        </form>
      ) : (
        <StyledButton
          as={"button"}
          {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {children}
        </StyledButton>
      )}
    </>
  );
};

const StyledButton = styled.input`
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  color: var(--color-txt--reversed);
  font-family: -system-ui, sans-serif;
  font-size: var(--font-size-button);
  line-height: 1.2;
  white-space: nowrap;
  text-decoration: none;
  padding: var(--spacing-xs) var(--spacing-md);
  cursor: pointer;
  &:hover {
    background: var(--color-primary-glint);
    border-color: var(--color-primary-glint);
    color: var(--color-txt--subtle-reversed);
  }
`;

export const IconButton = styled(Button)`
  background: transparent;
  border-color: transparent;
  color: var(--color-txt);
  width: var(--size-12);
  height: var(--size-12);
  font-size: var(--h4);
  padding: 0;
  &:hover {
    background: transparent;
    border-color: transparent;
    color: var(--color-txt--subtle);
  }
  ${Mobile as any} & {
    ${above.sm`
      display: none;
    `}
  }
`;
