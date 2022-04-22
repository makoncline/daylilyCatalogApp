import { Space } from "@app/design";
import React from "react";
import styled from "styled-components";

export const StandardWidth = ({ children }: { children: React.ReactNode }) => (
  <StyledSpace direction="column">{children}</StyledSpace>
);

const StyledSpace = styled(Space)`
  max-width: var(--max-width);
  align-items: center;
`;
