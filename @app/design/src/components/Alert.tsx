import React from "react";
import styled from "styled-components";

import { Heading } from "./Headings";

type AlertType = "success" | "danger" | "info";

type AlertProps = {
  type: AlertType;
  children: React.ReactNode;
};

function Alert({ type, children, ...props }: AlertProps) {
  const backgroundColors = {
    success: "--success--transparent",
    danger: "--danger--transparent",
    info: "--info--transparent",
  };
  const borderColors = {
    success: "--success",
    danger: "--danger",
    info: "--info",
  };
  const style = {
    "--border-color": `var(${borderColors[type]})`,
    "--background-color": `var(${backgroundColors[type]})`,
  } as React.CSSProperties;
  return (
    <StyledAlert style={style} {...props}>
      {children}
    </StyledAlert>
  );
}
const AlertHeading = ({ children }: { children: React.ReactNode }) => {
  return <Heading level={3}>{children}</Heading>;
};
Alert.Heading = AlertHeading;

export { Alert };

const StyledAlert = styled.div`
  border: 1px solid var(--border-color);
  background-color: var(--background-color);
  padding: var(--size-4) var(--size-4);
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
  max-width: var(--max-width-form);
`;

Alert.Body = styled.div``;
Alert.Actions = styled.div`
  display: flex;
  gap: var(--size-2);
`;
