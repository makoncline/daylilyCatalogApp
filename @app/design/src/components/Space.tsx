import React from "react";
import styled from "styled-components";
type Props = {
  direction?: "column" | "row";
  gap?: "small" | "medium" | "large";
  children: React.ReactNode;
};
const Space = ({
  direction = "row",
  gap = "small",
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
          "--direction": direction,
          "--gap": gapSize,
        } as React.CSSProperties
      }
    >
      {children}
    </Wrapper>
  );
};

export { Space };

const Wrapper = styled.div`
  display: flex;
  flex-direction: var(--direction);
  gap: var(--gap);
`;
