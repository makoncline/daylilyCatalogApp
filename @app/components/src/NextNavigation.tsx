import { Button, Link, Nav, TextLogo } from "@app/design";
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
        <NextNavLink href="/users">Users</NextNavLink>
        <NextNavLink href="/catalog">Catalog</NextNavLink>
        <NextNavLink href="/lists">Lists</NextNavLink>
        <NextNavLink href="/settings">Settings</NextNavLink>{" "}
        {/* put a warning here if not verified*/}
        <NextNavLink href="/membership">Membership</NextNavLink>
        <Button onClick={handleLogout}>Logout</Button>
      </>
    ) : (
      <NextNavLink href={`/login?next=${encodeURIComponent(currentUrl)}`}>
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
