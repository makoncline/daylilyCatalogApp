import { Heading } from "@app/design";
import Link from "next/link";
import React from "react";

export function ErrorOccurred() {
  return (
    <div>
      <Heading level={2}>Something Went Wrong</Heading>
      <p>
        We're not sure what happened there; how embarrassing! Please try again
        later, or if this keeps happening then let us know.
      </p>
      <p>
        <Link href="/">
          <a>Go to the homepage</a>
        </Link>
      </p>
    </div>
  );
}
