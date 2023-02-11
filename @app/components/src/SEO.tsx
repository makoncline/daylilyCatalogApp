import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

export const SEO = ({
  title,
  description,
  path,
  image,
  noRobots,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noRobots?: boolean;
}) => {
  const router = useRouter();
  const url = `${process.env.ROOT_URL}${path ? path : router.asPath}`;
  return (
    <Head>
      {title && (
        <>
          <title key="title">{title}</title>
          <meta key="og-title" property="og:title" content={title} />
          <meta key="twitter-title" name="twitter:title" content={title} />
        </>
      )}
      {description && (
        <>
          <meta key="description" name="description" content={description} />
          <meta
            key="og-description"
            property="og:description"
            content={description.slice(0, 159)}
          />
          <meta
            key="twitter-description"
            name="twitter:description"
            content={description.slice(0, 159)}
          />
        </>
      )}
      <>
        <link key="link" rel="canonical" href={url} />
        <meta key="og-link" property="og:url" content={url} />
        <meta key="twitter-link" name="twitter:url" content={url} />
      </>
      {image && (
        <>
          <meta key="og-image" property="og:image" content={image} />
          <meta key="twitter-image" name="twitter:image" content={image} />
        </>
      )}

      {noRobots && <meta key="robots" name="robots" content="noindex" />}
    </Head>
  );
};
