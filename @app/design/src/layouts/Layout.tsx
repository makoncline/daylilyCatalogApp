import React from "react";
import styled from "styled-components";

type Props = {
  navigation?: () => JSX.Element;
  children?: React.ReactNode;
  footer?: () => JSX.Element;
};

export const Layout = ({ navigation, children, footer }: Props) => {
  const Navigation = navigation;
  const Footer = footer;
  return (
    <>
      {Navigation && <Navigation />}
      <StyledMain>{children}</StyledMain>
      {Footer && <Footer />}
    </>
  );
};

const StyledMain = styled.main``;
