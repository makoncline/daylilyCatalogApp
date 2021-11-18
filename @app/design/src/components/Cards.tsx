import React from "react";
import styled from "styled-components";

export const Card = ({ children }: { children: React.ReactNode }) => {
  return <StyledCard>{children}</StyledCard>;
};

const Image = ({ children }: { children: React.ReactNode }) => {
  return <StyledImage>{children}</StyledImage>;
};

Card.Image = Image;

const StyledImage = styled.div``;
const StyledCard = styled.div`
  border: var(--hairline);
`;
