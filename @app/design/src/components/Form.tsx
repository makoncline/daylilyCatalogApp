import React from "react";
import styled from "styled-components";

import { Space } from "./Space";

export const Form = ({
  onSubmit,
  children,
}: {
  onSubmit: (event: any) => Promise<void>;
  children: React.ReactNode;
}) => {
  return (
    <Wrapper onSubmit={onSubmit}>
      <Space direction="column" gap="large">
        {children}
      </Space>
    </Wrapper>
  );
};

type FormGroupProps = {
  direction?: "row" | "column";
};
export const FormGroup = styled.div`
  display: flex;
  flex-direction: ${(props: FormGroupProps) =>
    props.direction === "row" ? "row" : "column"};
  align-items: ${(props: FormGroupProps) =>
    props.direction === "row" ? "center" : "flex-start"};
  gap: var(--size-2);
`;

export const Input = styled.input``;

export const Label = styled.label``;

export const Error = styled.pre`
  color: var(--danger);
  margin: 0;
`;

const Wrapper = styled.form``;
