import { Button, Navigation } from "@app/design";
import Link from "next/link";
import React from "react";

// page to display examples of various components
export default function KitchenSink() {
  const navLinks = [
    { href: "#", label: "Home" },
    { href: "#", label: "About" },
    { href: "#", label: "Contact" },
  ];
  const NavLogo = () => {
    return (
      <h1>
        <Link href="/">Logo</Link>
      </h1>
    );
  };
  return (
    <>
      <Navigation logo={<NavLogo />} links={navLinks} />
      <main>
        <h1>This is example text</h1>
        <h2>This is example text</h2>
        <h3>This is example text</h3>
        <h4>This is example text</h4>
        <h5>This is example text</h5>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.{" "}
        </p>
        <div
          style={{
            display: "flex",
            gap: "1rem",
          }}
        >
          <Button onClick={() => alert("click!")}>I'm a button</Button>
          <Button href="#">I'm a link </Button>
        </div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </main>
    </>
  );
}
