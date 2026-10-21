import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  Operation,
  split,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getDataFromTree } from "@apollo/client/react/ssr";
import { getOperationAST } from "graphql";
import { Client, createClient } from "graphql-ws";
import { NextComponentType, NextPageContext } from "next";
import { AppContext, AppInitialProps, AppProps } from "next/app";
import * as React from "react";

import { GraphileApolloLink } from "./GraphileApolloLink";

let wsClient: Client | null = null;

class WebSocketLink extends ApolloLink {
  public request(operation: Operation) {
    if (!wsClient) throw new Error("No websocket connection");
    return new GraphQLWsLink(wsClient).request(operation);
  }
}

let _rootURL: string | null = null;
function createWsClient() {
  if (!_rootURL) {
    throw new Error("No ROOT_URL");
  }
  const url = `${_rootURL.replace(/^http/, "ws")}/graphql`;
  return createClient({
    url,
  });
}

export function resetWebsocketConnection(): void {
  if (wsClient) {
    wsClient.dispose();
  }
  wsClient = createWsClient();
}

function makeServerSideLink(req: any, res: any) {
  return new GraphileApolloLink({
    req,
    res,
    postgraphileMiddleware: req.app.get("postgraphileMiddleware"),
  });
}

function makeClientSideLink(ROOT_URL: string) {
  if (_rootURL) {
    throw new Error("Must only makeClientSideLink once");
  }
  _rootURL = ROOT_URL;
  const nextDataEl = document.getElementById("__NEXT_DATA__");
  if (!nextDataEl || !nextDataEl.textContent) {
    throw new Error("Cannot read from __NEXT_DATA__ element");
  }
  const data = JSON.parse(nextDataEl.textContent);
  const CSRF_TOKEN = data.props.csrfToken;
  const httpLink = new HttpLink({
    uri: `${ROOT_URL}/graphql`,
    credentials: "same-origin",
    headers: {
      "CSRF-Token": CSRF_TOKEN,
    },
  });
  wsClient = createWsClient();
  const wsLink = new WebSocketLink();

  // Using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent.
  const mainLink = split(
    // split based on operation type
    ({ query, operationName }) => {
      const op = getOperationAST(query, operationName);
      return (op && op.operation === "subscription") || false;
    },
    wsLink,
    httpLink
  );
  return mainLink;
}

let browserClient: ApolloClient<NormalizedCacheObject> | undefined;

function createApolloClient(
  initialState?: NormalizedCacheObject,
  ctx?: NextPageContext
) {
  const ROOT_URL = process.env.ROOT_URL;
  if (!ROOT_URL) {
    throw new Error("ROOT_URL envvar is not set");
  }

  const onErrorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) =>
        console.error(
          `[GraphQL error]: message: ${message}, location: ${JSON.stringify(
            locations
          )}, path: ${JSON.stringify(path)}`
        )
      );
    if (networkError) console.error(`[Network error]: ${networkError}`);
  });

  const { req, res }: any = ctx || {};
  const isServer = typeof window === "undefined";
  const mainLink = isServer
    ? req && res
      ? makeServerSideLink(req, res)
      : ApolloLink.empty()
    : makeClientSideLink(ROOT_URL);

  const client = new ApolloClient({
    ssrMode: isServer,
    link: ApolloLink.from([onErrorLink, mainLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          queryType: true,
        },
      },
    }).restore(initialState || {}),
  });

  return client;
}

function getBrowserClient(initialState?: NormalizedCacheObject) {
  if (!browserClient) browserClient = createApolloClient(initialState);
  return browserClient;
}

type ApolloProps = { apollo: ApolloClient<NormalizedCacheObject> };

export function withApollo(
  AppComponent: NextComponentType<
    AppContext,
    AppInitialProps,
    AppProps & ApolloProps
  >
) {
  function WithApollo({
    apollo,
    apolloState,
    ...props
  }: AppProps & {
    apollo?: ApolloClient<NormalizedCacheObject>;
    apolloState?: NormalizedCacheObject;
  }) {
    const client =
      apollo ||
      (typeof window === "undefined"
        ? createApolloClient(apolloState)
        : getBrowserClient(apolloState));
    return <AppComponent {...props} apollo={client} />;
  }

  WithApollo.getInitialProps = async (context: AppContext) => {
    const isServer = typeof window === "undefined";
    const apollo = isServer
      ? createApolloClient(undefined, context.ctx)
      : getBrowserClient();
    const props = AppComponent.getInitialProps
      ? await AppComponent.getInitialProps(context)
      : { pageProps: {} };
    const { req, res } = context.ctx;
    if (isServer && req && res && !res.headersSent && !res.writableEnded) {
      const AppTree = context.AppTree;
      try {
        await getDataFromTree(<AppTree {...props} apollo={apollo} />);
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("GraphQL SSR failed", error);
        }
      }
    }
    if (isServer)
      Object.defineProperty(apollo, "toJSON", { value: () => null });
    return {
      ...props,
      apollo,
      apolloState: apollo.cache.extract(),
      csrfToken: isServer && req ? (req as any).csrfToken() : undefined,
      publicRuntimeConfig: {
        ROOT_URL: process.env.ROOT_URL,
        T_AND_C_URL: process.env.T_AND_C_URL,
        S3_UPLOAD_BUCKET: process.env.S3_UPLOAD_BUCKET,
        S3_RESIZED_IMAGE_BUCKET: process.env.S3_RESIZED_IMAGE_BUCKET,
        STRIPE_PLAN: process.env.STRIPE_PLAN,
        STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
      },
    };
  };

  return WithApollo;
}
