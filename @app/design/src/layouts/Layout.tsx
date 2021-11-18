import React from "react";
import styled from "styled-components";

type Props = {
  navigation?: JSX.Element;
  children?: React.ReactNode;
  footer?: JSX.Element;
};

export const Layout = ({ navigation, children, footer }: Props) => {
  return (
    <>
      {navigation}
      <StyledMain>{children}</StyledMain>
      {footer}
    </>
  );
};

const StyledMain = styled.main``;
