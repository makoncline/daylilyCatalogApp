import { Button, Heading, Link, Nav } from "@app/design";
import {
  catalogUrl,
  listsUrl,
  loginUrl,
  membershipUrl,
  registerUrl,
  settingsUrl,
  usersUrl,
} from "@app/lib";
import NextLink from "next/link";
import React from "react";

type Props = {
  handleLogout: () => void;
  isLoggedIn: boolean;
  currentUrl: string;
};

export const NextNavigation = ({
  handleLogout,
  isLoggedIn,
  currentUrl,
}: Props) => (
  <Nav logo={<NextTextLogo href="/">Daylily Catalog</NextTextLogo>}>
    {isLoggedIn ? (
      <>
        <NextNavLink href={usersUrl}>Users</NextNavLink>
        <NextNavLink href={catalogUrl}>Catalog</NextNavLink>
        <NextNavLink href={listsUrl}>Lists</NextNavLink>
        <NextNavLink href={settingsUrl} data-cy="link-settings">
          Settings
        </NextNavLink>{" "}
        {/* put a warning here if not verified*/}
        <NextNavLink href={membershipUrl}>Membership</NextNavLink>
        <Button onClick={handleLogout} data-cy="header-logout-button">
          Logout
        </Button>
      </>
    ) : [loginUrl, registerUrl].includes(currentUrl.split(/[?#]/)[0]) ? null : (
      <>
        <NextNavLink href={usersUrl}>Users</NextNavLink>
        <NextNavLink
          href={`${loginUrl}?next=${encodeURIComponent(currentUrl)}`}
          data-cy="header-login-button"
        >
          Sign in
        </NextNavLink>
      </>
    )}
  </Nav>
);

const NextNavLink = ({
  href,
  children,
  ...props
}: {
  href: string;
  children: string;
}) => (
  <Link as={NextLink} href={href} {...props}>
    {children}
  </Link>
);

const NextTextLogo = ({
  href,
  children,
  ...props
}: {
  href: string;
  children: string;
}) => (
  <NextLink href={href} {...props}>
    <Heading level={3}>{children}</Heading>
  </NextLink>
);
