import React from "react";
import styled from "styled-components";

import { above } from "../utilities";
import { IconButton } from ".";

type Props = {
  logo?: React.ReactNode;
  links: Link[];
};

type Link = {
  href: string;
  label: string;
};

export const Navigation = ({ logo, links }: Props) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const handleToggle = () => setIsOpen(!isOpen);
  const Links = ({ ...props }) => (
    <div {...props}>
      <ul className="nav--links">
        {links.map((link, index) => (
          <li key={index}>
            <a href={link.href}>
              <span>{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);
  return (
    <StyledNavigation>
      <div className={`nav ${isOpen && "nav--open"}`}>
        <div className={`nav--main`}>
          <div className="nav--logo">{logo}</div>
          <Links className="nav--main--links" />
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
  .nav--links {
    margin-top: var(--spacing-sm);
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

  ${above.sm`
    .nav{
      align-items: center;
    }
    .nav--links {
      display: flex;
      justify-content: center;
    }
    .nav--links--toggle{
      display: none;
    }
    .nav--main--links {
      display: unset;
    }
  `}
`;
