import { Link, Nav, TextLogo } from "@app/design";
import NextLink from "next/link";
import React from "react";

export const NextNavigation = () => (
  <Nav logo={<NextTextLogo href="/">Daylily Catalog</NextTextLogo>}>
    <NextNavLink href="/users">Users</NextNavLink>
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
