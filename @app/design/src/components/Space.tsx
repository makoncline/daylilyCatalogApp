import React from "react";
import styled from "styled-components";
type Props = {
  direction?: "column" | "row";
  gap?: "small" | "medium" | "large";
  children: React.ReactNode;
  center?: boolean;
  [key: string]: any;
};
const Space = ({
  direction = "row",
  gap = "small",
  center = false,
  children,
  ...props
}: Props) => {
  const gapSize =
    gap === "small"
      ? "var(--size-2)"
      : gap === "medium"
      ? "var(--size-4)"
      : "var(--size-6)";
  return (
    <Wrapper
      {...props}
      style={
        {
          ...props.style,
          "--direction": direction,
          "--gap": gapSize,
        } as React.CSSProperties
      }
      center={center}
    >
      {children}
    </Wrapper>
  );
};

export { Space };

const Wrapper = styled.div<{ center: boolean }>`
  display: flex;
  flex-direction: var(--direction);
  gap: var(--gap);
  justify-content: ${({ center }) => (center ? "center" : "unset")};
  align-items: ${({ center }) => (center ? "center" : "unset")};
`;
