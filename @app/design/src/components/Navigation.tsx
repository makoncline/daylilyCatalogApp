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
            <a href={link.href}>{link.label}</a>
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
    background-color: var(--color-navigation-background);
    width: var(--width-header);
    margin: 0 auto;
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .logo {
    margin: 0;
  }
  a {
    text-decoration: none;
    padding: var(--spacing-sm) var(--spacing-md);
    text-transform: uppercase;
    text-align: center;
    display: block;
  }
  .nav--links {
    margin-top: var(--spacing-sm);
  }
  .nav--links a {
    color: var(--color-link-nav);
  }
  .nav--links a:hover {
    color: var(--color-link-nav-hover);
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
    }
    .nav--links--toggle{
      display: none;
    }
    .nav--main--links {
      display: unset;
    }
  `}
`;
