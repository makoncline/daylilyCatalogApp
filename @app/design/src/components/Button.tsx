import React from "react";
import styled from "styled-components";

import { above } from "../utilities";
import { Mobile as MoblieNav } from "./";

type Props = {
  children: string;
  href?: string;
  [other: string]: unknown;
};

export const Button = React.forwardRef(
  (
    { children, href, ...props }: Props,
    ref: React.ForwardedRef<HTMLButtonElement>
  ) => {
    const isLink = typeof href === "string";
    return (
      <>
        {isLink ? (
          <form action={href} method="get">
            <StyledButton
              style={{ width: "100%" }}
              type="submit"
              ref={ref}
              {...props}
            >
              {children}
            </StyledButton>
          </form>
        ) : (
          <StyledButton type="button" ref={ref} {...props}>
            {children}
          </StyledButton>
        )}
      </>
    );
  }
);
Button.displayName = "Button";

const StyledButton = styled.button`
  display: inline-flex;
  justify-content: center;
  white-space: nowrap;

  font-size: var(--font-size-1);
  font-weight: var(--font-weight-7);

  padding-inline: var(--size-3);
  padding-block: var(--size-1);

  color: var(--text-1);
  border: var(--border-size-2) solid var(--text-1);
  background-color: transparent;
  border-radius: var(--radius-2);
  :hover {
    cursor: pointer;
    border-color: var(--text-2);
    color: var(--text-2);

    @media (prefers-color-scheme: light) {
      text-shadow: 0 1px 0 var(--shadow-color);
    }
  }

  &:active {
    position: relative;
    inset-block-start: 1px;
  }
`;

export const IconButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  border-color: transparent;
  width: var(--size-10);
  height: var(--size-10);
  &:hover {
    background: transparent;
    border-color: transparent;
    color: var(--text-2);
  }
  ${MoblieNav} & {
    ${above.sm`
      display: none;
    `}
  }
`;
