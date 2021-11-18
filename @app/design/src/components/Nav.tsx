import React from "react";
import styled from "styled-components";

import { above } from "../utilities";
import { IconButton } from ".";

type NavProps = {
  logo: React.ReactNode;
  children: React.ReactNode;
};

type NavLinkProps = {
  href?: string;
  children: string;
};

export const NavLink = ({ href, children }: NavLinkProps) => (
  <li>
    <a href={href}>
      <span>{children}</span>
    </a>
  </li>
);

type TextLogoProps = {
  href?: string;
  children: string;
};

export const TextLogo = ({ href, children }: TextLogoProps) => {
  return (
    <h1 className="nav--text-logo">
      <a href={href}>{children}</a>
    </h1>
  );
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
  const Links = () => <ul className="nav--links">{children}</ul>;
  return (
    <StyledNavigation>
      <div className={`nav ${isOpen && "nav--open"}`}>
        <div className={`nav--main`}>
          <div className="nav--logo">{logo}</div>
          <div className="nav--main--links">
            <Links />
          </div>
          <IconButton className="nav--links--toggle" onClick={handleToggle}>
            {isOpen ? "✕ " : "☰"}
          </IconButton>
        </div>
        <div className="nav--mobile--links">{isOpen && <Links />}</div>
      </div>
    </StyledNavigation>
  );
};

const StyledNavigation = styled.nav`
  .nav {
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .nav--main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--spacing-sm);
    padding-bottom: var(--spacing-sm);
    background-color: var(--color-nav-bg);
    width: var(--width-header);
    margin: 0 auto;
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  .logo {
    margin: 0;
  }
  a {
    text-decoration: none;
    text-transform: uppercase;
    text-align: center;
    display: block;
  }
  .nav--links a span {
    color: var(--color-text-primary);
    border-bottom: 1px solid transparent;
  }
  .nav--links a:hover span {
    color: var(--color-text-secondary);
    border-color: var(--color-text-secondary);
  }
  .nav--main--links {
    display: none;
  }
  .nav--open {
    height: 100vh;
  }
  .nav--text-logo {
    margin-bottom: 0;
  }

  ${above.sm`
    .nav{
      align-items: center;
    }
    .nav--links {
      display: flex;
      justify-content: center;
    }
    .nav--links--toggle, .nav--mobile--links{
      display: none;
    }
    .nav--main--links {
      display: unset;
    }
  `}
`;
