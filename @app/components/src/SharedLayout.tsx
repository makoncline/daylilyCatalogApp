import { ApolloError, QueryResult, useApolloClient } from "@apollo/client";
import { projectName } from "@app/config/dist";
import { Heading } from "@app/design";
import {
  SharedLayout_QueryFragment,
  SharedLayout_UserFragment,
  useCurrentUserUpdatedSubscription,
  useLogoutMutation,
} from "@app/graphql";
import { loginUrl } from "@app/lib";
import Head from "next/head";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import * as React from "react";
import { useCallback } from "react";

import { ErrorAlert, NextLayout, StandardWidth } from ".";
import { Redirect } from "./Redirect";

/*
 * For some reason, possibly related to the interaction between
 * `babel-plugin-import` and https://github.com/babel/babel/pull/9766, we can't
 * directly export these values, but if we reference them and re-export then we
 * can.
 *
 * TODO: change back to `export { Row, Col, Link }` when this issue is fixed.
 */
export { Link };

export const contentMinHeight = "calc(100vh - 64px - 70px)";

export interface SharedLayoutChildProps {
  error?: ApolloError | Error;
  loading: boolean;
  currentUser?: SharedLayout_UserFragment | null;
}

export enum AuthRestrict {
  NEVER = 0,
  LOGGED_OUT = 1 << 0,
  LOGGED_IN = 1 << 1,
  NOT_ADMIN = 1 << 2,
}

export interface SharedLayoutProps {
  /*
   * We're expecting lots of different queries to be passed through here, and
   * for them to have this common required data we need. Methods like
   * `subscribeToMore` are too specific (and we don't need them) so we're going
   * to drop them from the data requirements.
   *
   * NOTE: we're not fetching this query internally because we want the entire
   * page to be fetchable via a single GraphQL query, rather than multiple
   * chained queries.
   */
  query: Pick<
    QueryResult<SharedLayout_QueryFragment>,
    "data" | "loading" | "error" | "networkStatus" | "client" | "refetch"
  >;

  title: string;
  titleHref?: string;
  titleHrefAs?: string;
  children:
    | React.ReactNode
    | ((props: SharedLayoutChildProps) => React.ReactNode);
  noPad?: boolean;
  noHandleErrors?: boolean;
  forbidWhen?: AuthRestrict;
}

/* The Apollo `useSubscription` hook doesn't currently allow skipping the
 * subscription; we only want it when the user is logged in, so we conditionally
 * call this stub component.
 */
function CurrentUserUpdatedSubscription() {
  /*
   * This will set up a GraphQL subscription monitoring for changes to the
   * current user. Interestingly we don't need to actually _do_ anything - no
   * rendering or similar - because the payload of this mutation will
   * automatically update Apollo's cache which will cause the data to be
   * re-rendered wherever appropriate.
   */
  useCurrentUserUpdatedSubscription();
  return null;
}

export function SharedLayout({
  title,
  titleHref,
  titleHrefAs,
  noPad = false,
  noHandleErrors = false,
  query,
  forbidWhen = AuthRestrict.NEVER,
  children,
}: SharedLayoutProps) {
  const router = useRouter();
  const currentUrl = router?.asPath;
  const client = useApolloClient();
  const [logout] = useLogoutMutation();
  const handleLogout = useCallback(() => {
    const reset = async () => {
      Router.events.off("routeChangeComplete", reset);
      try {
        await logout();
        client.resetStore();
      } catch (e) {
        console.error(e);
        // Something went wrong; redirect to /logout to force logout.
        window.location.href = "/logout";
      }
    };
    Router.events.on("routeChangeComplete", reset);
    Router.push("/");
  }, [client, logout]);
  const forbidsLoggedIn = forbidWhen & AuthRestrict.LOGGED_IN;
  const forbidsLoggedOut = forbidWhen & AuthRestrict.LOGGED_OUT;
  const forbidsNotAdmin = forbidWhen & AuthRestrict.NOT_ADMIN;
  const renderChildren = (props: SharedLayoutChildProps) => {
    const inner =
      props.error && !props.loading && !noHandleErrors ? (
        <>
          {process.env.NODE_ENV === "development" ? (
            <ErrorAlert error={props.error} />
          ) : null}
        </>
      ) : typeof children === "function" ? (
        children(props)
      ) : (
        children
      );
    if (
      data &&
      data.currentUser &&
      (forbidsLoggedIn || (forbidsNotAdmin && !data.currentUser.isAdmin))
    ) {
      return (
        <StandardWidth>
          <Redirect href={"/"} />
        </StandardWidth>
      );
    } else if (
      data &&
      data.currentUser === null &&
      !loading &&
      !error &&
      forbidsLoggedOut
    ) {
      return (
        <Redirect
          href={`${loginUrl}?next=${encodeURIComponent(router.asPath)}`}
        />
      );
    }

    return noPad ? inner : <StandardWidth>{inner}</StandardWidth>;
  };
  const { data, loading, error } = query;

  return (
    <NextLayout
      handleLogout={handleLogout}
      isLoggedIn={!!data?.currentUser}
      currentUrl={currentUrl}
    >
      {data && data.currentUser ? <CurrentUserUpdatedSubscription /> : null}
      <Head>
        <title>{title ? `${title} — ${projectName}` : projectName}</title>
      </Head>
      <Heading level={1} data-cy="layout-header-title">
        {titleHref ? (
          <Link href={titleHref} as={titleHrefAs}>
            <a data-cy="layout-header-titlelink">{title}</a>
          </Link>
        ) : (
          title
        )}
      </Heading>
      {renderChildren({
        error,
        loading,
        currentUser: data && data.currentUser,
      })}
    </NextLayout>
  );
}
