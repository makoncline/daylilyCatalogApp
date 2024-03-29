import { useApolloClient } from "@apollo/client";
import { Center, Heading, Spinner } from "@app/design";
import Router from "next/router";
import React, { useEffect } from "react";

import { SharedLayout } from "./SharedLayout";
import { StandardWidth } from "./StandardWidth";

export interface RedirectProps {
  href: string;
  as?: string;
  layout?: boolean;
}

export function Redirect({ href, as, layout }: RedirectProps) {
  const client = useApolloClient();
  useEffect(() => {
    Router.push(href, as);
  }, [as, href]);
  if (layout) {
    return (
      <SharedLayout
        title="Redirecting..."
        query={{
          loading: true,
          data: undefined,
          error: undefined,
          networkStatus: 0,
          client,
          refetch: (async () => {
            throw new Error("Redirecting...");
          }) as any,
        }}
      >
        <Center>
          <Spinner />
        </Center>
      </SharedLayout>
    );
  } else {
    return (
      <StandardWidth>
        <Heading level={3}>Redirecting...</Heading>
        <Center>
          <Spinner />
        </Center>
      </StandardWidth>
    );
  }
}
