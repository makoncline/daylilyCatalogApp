import { Space } from "@app/design";
import {
  deleteUrl,
  emailsUrl,
  loginUrl,
  securityUrl,
  settingsUrl,
} from "@app/lib";
import Link from "next/link";
import { NextRouter, useRouter } from "next/router";
import * as qs from "querystring";
import React from "react";

import { Redirect } from "./Redirect";
import {
  AuthRestrict,
  SharedLayout,
  SharedLayoutChildProps,
  SharedLayoutProps,
} from "./SharedLayout";
import { StandardWidth } from "./StandardWidth";

interface PageSpec {
  title: string;
  cy: string;
  warnIfUnverified?: boolean;
}

// TypeScript shenanigans (so we can still use `keyof typeof pages` later)
function page(spec: PageSpec): PageSpec {
  return spec;
}

const pages = {
  [settingsUrl]: page({
    title: "Profile",
    cy: "settingslayout-link-profile",
  }),
  [securityUrl]: page({
    title: "Passphrase",
    cy: "settingslayout-link-password",
  }),
  [emailsUrl]: page({
    title: "Emails",
    warnIfUnverified: true,
    cy: "settingslayout-link-emails",
  }),
  [deleteUrl]: page({
    title: "Delete Account",
    cy: "settingslayout-link-delete",
  }),
};

export interface SettingsLayoutProps {
  query: SharedLayoutProps["query"];
  href: keyof typeof pages;
  children: React.ReactNode;
  noPad?: boolean;
}

export function SettingsLayout({
  query,
  href: inHref,
  children,
  noPad = false,
}: SettingsLayoutProps) {
  const href = pages[inHref] ? inHref : Object.keys(pages)[0];
  const page = pages[href];
  // `useRouter()` sometimes returns null
  const router: NextRouter | null = useRouter();
  const fullHref =
    href + (router && router.query ? `?${qs.stringify(router.query)}` : "");
  return (
    <SharedLayout
      title={`Settings: ${page.title}`}
      noPad
      query={query}
      forbidWhen={AuthRestrict.LOGGED_OUT}
    >
      {({ currentUser, error, loading }: SharedLayoutChildProps) =>
        !currentUser && !error && !loading ? (
          <Redirect href={`${loginUrl}?next=${encodeURIComponent(fullHref)}`} />
        ) : (
          <Space direction="column">
            <Space direction="row" gap="large">
              {Object.keys(pages).map((pageHref, i) => (
                <Link href={pageHref} key={i}>
                  <a data-cy={pages[pageHref].cy}>
                    <p>{pages[pageHref].title}</p>
                  </a>
                </Link>
              ))}
            </Space>
            {noPad ? children : <StandardWidth>{children}</StandardWidth>}
          </Space>
        )
      }
    </SharedLayout>
  );
}
