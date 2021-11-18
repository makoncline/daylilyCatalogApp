import { Nav, NavLink, TextLogo } from "@app/design";
import Link from "next/link";
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
  <Link href={href} passHref>
    <NavLink>{children}</NavLink>
  </Link>
);

const NextTextLogo = ({
  href,
  children,
}: {
  href: string;
  children: string;
}) => (
  <Link href={href} passHref>
    <TextLogo>{children}</TextLogo>
  </Link>
);
