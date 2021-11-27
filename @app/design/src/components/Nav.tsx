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
  const closeOnResize = () => setIsOpen(false);
  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
  }, [isOpen]);
  React.useEffect(() => {
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  });
  return (
    <Wrapper>
      <Main>
        <div>{logo}</div>
        <NavItems>{children}</NavItems>
        <IconButton onClick={handleToggle}>{isOpen ? "✕ " : "☰"}</IconButton>
      </Main>
      <Mobile>
        {isOpen && (
          <NavItems className={`${isOpen && "nav--open"}`}>{children}</NavItems>
        )}
      </Mobile>
    </Wrapper>
  );
};

type TextLogoProps = {
  href?: string;
  children: string;
};

export const TextLogo = ({ href, children }: TextLogoProps) => {
  return (
    <a href={href}>
      <Heading level={2}>{children}</Heading>
    </a>
  );
};

const Wrapper = styled.nav`
  padding: var(--spacing-lg) 0;
  background-color: var(--color-bg--main);
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

export const Mobile = styled.div`
  ${above.sm`
    display: none;
  `}
`;
const Main = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
  width: var(--width-header);
  margin: 0 auto;
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
  ${above.sm`
    ${Mobile as any} & {
      display: none;
    }
    ${Main as any} & {
      display: unset;
    }
  `}
`;
