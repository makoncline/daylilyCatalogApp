import { Button, Link, Nav, TextLogo } from "@app/design";
import {
  catalogUrl,
  listsUrl,
  loginUrl,
  membershipUrl,
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
        <NextNavLink href={settingsUrl}>Settings</NextNavLink>{" "}
        {/* put a warning here if not verified*/}
        <NextNavLink href={membershipUrl}>Membership</NextNavLink>
        <Button onClick={handleLogout}>Logout</Button>
      </>
    ) : (
      <NextNavLink href={`${loginUrl}?next=${encodeURIComponent(currentUrl)}`}>
        Sign in
      </NextNavLink>
    )}
  </Nav>
);

const NextNavLink = ({
  href,
  children,
}: {
  href: string;
  children: string;
}) => (
  <NextLink href={href} passHref>
    <Link>{children}</Link>
  </NextLink>
);

const NextTextLogo = ({
  href,
  children,
}: {
  href: string;
  children: string;
}) => (
  <NextLink href={href} passHref>
    <TextLogo>{children}</TextLogo>
  </NextLink>
);
