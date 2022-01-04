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
        <LogoWrapper>{logo}</LogoWrapper>
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

export const TextLogo = React.forwardRef<
  HTMLAnchorElement,
  {
    children: React.ReactNode;
  }
>(({ children, ...props }, ref) => (
  <a ref={ref} {...props}>
    <Heading level={3}>{children}</Heading>
  </a>
));
TextLogo.displayName = "TextLogo";

const LogoWrapper = styled.div`
  margin-inline-end: auto;
`;
export const Wrapper = styled.nav`
  padding: var(--size-4) 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-self: stretch;
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
  padding-top: var(--size-2);
  padding-bottom: var(--size-2);
  width: 100%;
  margin: 0 auto;
`;

export const NavItem = styled.li`
  padding: var(--size-2) var(--size-3);
`;

const NavItems = styled.ul`
  display: flex;
  gap: var(--size-3);
  flex-direction: column;
  padding: 0;
  list-style: none;
  ${Main} & {
    display: none;
  }
  ${above.sm`
    ${Mobile} & {
      display: none;
    }
    ${Main} & {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin: 0;
    }
  `}
`;
