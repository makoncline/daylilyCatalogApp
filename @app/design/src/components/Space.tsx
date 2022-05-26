import React, { Children } from "react";
import styled from "styled-components";

import { below } from "../utilities";
type Props = {
  direction?: "column" | "row";
  gap?: "none" | "small" | "medium" | "large";
  children: React.ReactNode;
  center?: boolean;
  responsive?: boolean;
  block?: boolean;
  [key: string]: any;
};
const Space = React.forwardRef(
  (
    {
      direction = "row",
      gap = "small",
      center = false,
      responsive = false,
      block = false,
      children,
      style,
      ...props
    }: Props,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    const gapSize =
      gap === "none"
        ? 0
        : gap === "small"
        ? "var(--size-4)"
        : gap === "medium"
        ? "var(--size-8)"
        : "var(--size-12)";
    return (
      <Wrapper
        style={
          {
            ...style,
            "--direction": direction,
            "--gap": gapSize,
          } as React.CSSProperties
        }
        center={center}
        responsive={responsive}
        block={block}
        items={Children.count(children)}
        ref={ref}
        {...props}
      >
        {children}
      </Wrapper>
    );
  }
);
Space.displayName = "Space";

export { Space };

const Wrapper = styled.div<{
  center: boolean;
  responsive: boolean;
  items: number;
  block: boolean;
}>`
  display: flex;
  flex-direction: var(--direction);
  gap: var(--gap);
  justify-content: ${({ center }) => (center ? "center" : "unset")};
  align-items: ${({ center }) => (center ? "center" : "unset")};
  max-width: var(--full-width);
  ${({ block }) => block && "width: 100%;"}
  ${({ responsive, items, center }) =>
    responsive &&
    `
      display: grid;
      grid-template-columns: repeat(${items},minmax(min-content,max-content));
      align-items: start;
      ${below.md`
        justify-items: ${center ? "center" : "unset"};
        grid-template-columns: 1fr;
      `}
  `};
`;
