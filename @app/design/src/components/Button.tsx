import React from "react";
import styled from "styled-components";

import { above } from "../utilities";
import { Mobile as MoblieNav } from "./";

type ButtonType = "primary" | "default" | "text";

type Props = {
  children: string;
  href?: string;
  block?: boolean;
  styleType?: ButtonType;
  danger?: boolean;
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = React.forwardRef(
  (
    {
      children: child,
      href,
      block = false,
      styleType = "default",
      danger = false,
      disabled = false,
      ...props
    }: Props,
    ref: React.ForwardedRef<HTMLButtonElement>
  ) => {
    const isLink = typeof href === "string";
    let border = "var(--text-3)";
    let borderGlint = "var(--text-1)";
    let background = "transparent";
    let backgroundGlint = background;
    let color = "var(--text-1)";
    let width = "auto";
    if (danger) {
      border = "var(--danger)";
      borderGlint = "var(--danger--glint)";
      color = "var(--danger)";
    }
    switch (styleType) {
      case "primary": {
        border = danger ? "var(--danger)" : "var(--primary)";
        borderGlint = danger ? "var(--danger--glint)" : "var(--primary--glint)";
        background = border;
        backgroundGlint = borderGlint;
        color = "var(--text-1)";
        break;
      }
      case "text": {
        border = "transparent";
        break;
      }
    }
    if (block) {
      width = "100%";
    }
    if (disabled) {
    }

    const style = {
      "--border": border,
      "--border--glint": borderGlint,
      "--background": background,
      "--background--glint": backgroundGlint,
      "--color": color,
      "--width": width,
    } as React.CSSProperties;

    return (
      <>
        {isLink ? (
          <form
            action={href}
            method="get"
            style={block ? { width: "100%" } : {}}
          >
            <StyledButton
              type="submit"
              style={style}
              ref={ref}
              disabled={disabled}
              {...props}
            >
              {child}
            </StyledButton>
          </form>
        ) : (
          <StyledButton
            type="button"
            style={style}
            ref={ref}
            disabled={disabled}
            {...props}
          >
            {child}
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

  border: var(--hairline);
  border-radius: var(--radius-2);

  border-color: var(--border);
  background-color: var(--background);
  color: var(--color);
  width: var(--width);
  :hover {
    cursor: pointer;
    background-color: var(--background--glint);
    border-color: var(--border--glint);

    @media (prefers-color-scheme: light) {
      text-shadow: 0 1px 0 var(--shadow-color);
    }
  }
  &:active {
    position: relative;
    inset-block-start: 1px;
  }
  :disabled {
    cursor: not-allowed;
    border-color: var(--text-3);
    background-color: transparent;
    color: var(--text-3);
    :active {
      inset-block-start: 0;
    }
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
