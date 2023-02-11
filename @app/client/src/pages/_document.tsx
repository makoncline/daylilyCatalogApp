import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";
import React from "react";
import { ServerStyleSheet } from "styled-components";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;
    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });
      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content={"Build your daylily business here. Share your daylily garden with the world. Add your daylily listings, upload photos, make lists, and access data and photos of 90,000+ registered daylilies with just a few clicks.".slice(
              0,
              159
            )}
          />
          <meta
            property="og:title"
            content="Create a website for your daylily garden - Get started for free"
          />
          <meta property="og:type" content="website" />
          <meta
            property="og:image"
            content="https://images.daylilycatalog.com/3/421a08-image.webp"
          />
          <meta property="og:url" content="https://daylilycatalog.com" />
          <meta property="og:see_also" content="https://daylilycatalog.com" />
          <meta property="og:description" content="Daylily Catalog" />
          <meta property="og:site_name" content="Daylily Catalog" />
          <meta property="og:locale" content="en_US" />
          <meta name="twitter:card" content="summary" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
