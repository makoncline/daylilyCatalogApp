import "nprogress/nprogress.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "../styles.css";
import "@reach/dialog/styles.css";
import "regenerator-runtime/runtime";

import { ApolloClient, ApolloProvider } from "@apollo/client";
import { FormValuesProvider } from "@app/design";
import { withApollo } from "@app/lib";
import App from "next/app";
import Head from "next/head";
import Router from "next/router";
import NProgress from "nprogress";
import * as React from "react";

declare global {
  interface Window {
    __GRAPHILE_APP__: {
      ROOT_URL?: string;
      T_AND_C_URL?: string;
      S3_UPLOAD_BUCKET?: string;
      S3_RESIZED_IMAGE_BUCKET?: string;
    };
  }
}

NProgress.configure({
  showSpinner: false,
});

if (typeof window !== "undefined") {
  const nextDataEl = document.getElementById("__NEXT_DATA__");
  if (!nextDataEl || !nextDataEl.textContent) {
    throw new Error("Cannot read from __NEXT_DATA__ element");
  }
  const data = JSON.parse(nextDataEl.textContent);
  window.__GRAPHILE_APP__ = {
    ROOT_URL: data.query.ROOT_URL,
    T_AND_C_URL: data.query.T_AND_C_URL,
    S3_UPLOAD_BUCKET: data.query.S3_UPLOAD_BUCKET,
    S3_RESIZED_IMAGE_BUCKET: data.query.S3_RESIZED_IMAGE_BUCKET,
  };

  Router.events.on("routeChangeStart", () => {
    NProgress.start();
  });

  Router.events.on("routeChangeComplete", () => {
    NProgress.done();
  });
  Router.events.on("routeChangeError", (err: Error | string) => {
    NProgress.done();
    if (err["cancelled"]) {
      // No worries; you deliberately cancelled it
    } else {
      alert(
        `This is very embarrassing! Please reload the page. Further error details: ${
          typeof err === "string" ? err : err.message
        }`
      );
    }
  });
}

class MyApp extends App<{ apollo: ApolloClient<any> }> {
  static async getInitialProps({ Component, ctx }: any) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps, apollo } = this.props;

    return (
      <ApolloProvider client={apollo}>
        <FormValuesProvider>
          <Component {...pageProps} />
        </FormValuesProvider>
      </ApolloProvider>
    );
  }
}

export default withApollo(MyApp);
