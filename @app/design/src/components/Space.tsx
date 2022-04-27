import React, { Children } from "react";
import styled from "styled-components";

import { below } from "../utilities";
type Props = {
  direction?: "column" | "row";
  gap?: "small" | "medium" | "large";
  children: React.ReactNode;
  center?: boolean;
  responsive?: boolean;
  block?: boolean;
  [key: string]: any;
};
const Space = ({
  direction = "row",
  gap = "small",
  center = false,
  responsive = false,
  block = false,
  children,
  ...props
}: Props) => {
  const gapSize =
    gap === "small"
      ? "var(--size-4)"
      : gap === "medium"
      ? "var(--size-8)"
      : "var(--size-12)";
  return (
    <Wrapper
      style={
        {
          ...props.style,
          "--direction": direction,
          "--gap": gapSize,
        } as React.CSSProperties
      }
      center={center}
      responsive={responsive}
      block={block}
      items={Children.count(children)}
      {...props}
    >
      {children}
    </Wrapper>
  );
};

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
  ${({ block }) => block && "width: 100%;"}
  ${({ responsive, items, center }) =>
    responsive &&
    `
      display: grid;
      grid-template-columns: repeat(${items},auto);
      align-items: start;
      ${below.md`
        justify-items: ${center ? "center" : "unset"};
        grid-template-columns: 1fr;
      `}
  `};
`;
