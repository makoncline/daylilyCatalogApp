import React from "react";
import styled from "styled-components";

import { above } from "../utilities";
import { Heading, IconButton } from ".";

type NavProps = {
  logo: React.ReactNode;
  children: React.ReactNode;
};

export const Nav = ({ logo, children }: NavProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const handleToggle = () => setIsOpen(!isOpen);
  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);
  const closeOnResize = () => setIsOpen(false);
  React.useEffect(() => {
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  });
  return (
    <Wrapper className={`${isOpen && "nav--open"}`}>
      <Main>
        <Logo>{logo}</Logo>
        <NavItems>{children}</NavItems>
        <IconButton onClick={handleToggle}>{isOpen ? "✕ " : "☰"}</IconButton>
      </Main>
      <Mobile>{isOpen && <NavItems>{children}</NavItems>}</Mobile>
    </Wrapper>
  );
};

type TextLogoProps = {
  href?: string;
  children: string;
};

export const TextLogo = ({ href, children }: TextLogoProps) => {
  return (
    <Heading level={2}>
      <a href={href}>{children}</a>
    </Heading>
  );
};

export const Mobile = styled.div`
  ${above.sm`
    display: none;
  `}
`;
const Logo = styled.div``;
const Main = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
  background-color: var(--color-nav-bg);
  width: var(--width-header);
  margin: 0 auto;
`;
const Wrapper = styled.nav`
  position: relative;
  display: flex;
  flex-direction: column;
  .nav--open {
    height: 100vh;
  }
  ${above.sm`
    align-items: center;
  `}
`;

export const NavItem = styled.li`
  padding: var(--spacing-sm) var(--spacing-md);
`;

const NavItems = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  ${Main as any} & {
    display: none;
  }
  .nav--open {
    height: 100vh;
  }
  ${above.sm`
    ${Mobile as any} & {
      display: none;
    }
    ${Main as any} & {
      display: unset;
    }
  `}
`;
