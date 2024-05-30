require("@app/config");
require("sharp");

if (!process.env.ROOT_URL) {
  if (process.argv[1].endsWith("/depcheck")) {
    /* NOOP */
  } else {
    throw new Error("ROOT_URL is a required envvar");
  }
}
var sentryDisabled = false;
if (!process.env.SENTRY_AUTH_TOKEN) {
  sentryDisabled = true;
}
var sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
(function (process = null) {
  // You *must not* use `process.env` in here, because we need to check we have
  // those variables. To enforce this, we've deliberately shadowed process.
  module.exports = () => {
    const { withSentryConfig } = require("@sentry/nextjs");
    const sentryWebpackPluginOptions = {
      org: "makon-dev",
      project: "daylily-catalog-app",
      authToken: sentryAuthToken,
      silent: true,
      disableClientWebpackPlugin: sentryDisabled,
      disableServerWebpackPlugin: sentryDisabled,
    };

    const sentryOptions = {
      widenClientFileUpload: true,
      hideSourceMaps: true,
    };

    return withSentryConfig(
      {
        async rewrites() {
          return [
            {
              source: "/sitemap.xml",
              destination: "/api/sitemap",
            },
          ];
        },
        async redirects() {
          return [
            {
              source: "/starcrossedseeds",
              destination: "/users/87",
              permanent: false,
            },
          ];
        },
        webpack5: false,
        images: {
          domains: [
            "daylily-catalog-images-stage.s3.amazonaws.com",
            "daylily-catalog-images.s3.amazonaws.com",
            "daylilies.org",
            "www.daylilies.org",
            "localhost",
            "daylilycatalog.com",
            "app.daylilycatalog.com",
            "images.daylilycatalog.com",
            "images-stage.daylilycatalog.com",
            "source.boringavatars.com",
            "www.daylilydatabase.org",
          ],
          minimumCacheTTL: 3600,
          deviceSizes: [200, 400, 800],
          imageSizes: [16, 100],
        },
        poweredByHeader: false,
        distDir: `../.next`,
        trailingSlash: false,
        webpack(config, { webpack, dev, isServer }) {
          if (dev) config.devtool = "cheap-module-source-map";

          const makeSafe = (externals) => {
            if (Array.isArray(externals)) {
              return externals.map((ext) => {
                if (typeof ext === "function") {
                  return (context, request, callback) => {
                    if (/^@app\//.test(request)) {
                      callback();
                    } else {
                      return ext(context, request, callback);
                    }
                  };
                } else {
                  return ext;
                }
              });
            }
          };

          const externals =
            isServer && dev ? makeSafe(config.externals) : config.externals;

          return {
            ...config,
            plugins: [
              ...config.plugins,
              new webpack.DefinePlugin({
                /*
                 * IMPORTANT: we don't want to hard-code these values, otherwise
                 * we cannot promote a bundle to another environment. Further,
                 * they need to be valid both within the browser _AND_ on the
                 * server side when performing SSR.
                 */
                "process.env.ROOT_URL":
                  "(typeof window !== 'undefined' ? window.__GRAPHILE_APP__.ROOT_URL : process.env.ROOT_URL)",
                "process.env.T_AND_C_URL":
                  "(typeof window !== 'undefined' ? window.__GRAPHILE_APP__.T_AND_C_URL : process.env.T_AND_C_URL)",
                "process.env.S3_UPLOAD_BUCKET":
                  "(typeof window !== 'undefined' ? window.__GRAPHILE_APP__.S3_UPLOAD_BUCKET : process.env.S3_UPLOAD_BUCKET)",
                "process.env.S3_RESIZED_IMAGE_BUCKET":
                  "(typeof window !== 'undefined' ? window.__GRAPHILE_APP__.S3_RESIZED_IMAGE_BUCKET : process.env.S3_RESIZED_IMAGE_BUCKET)",
                "process.env.STRIPE_PUBLISHABLE_KEY":
                  "(typeof window !== 'undefined' ? window.__GRAPHILE_APP__.STRIPE_PUBLISHABLE_KEY : process.env.STRIPE_PUBLISHABLE_KEY)",
                "process.env.STRIPE_PLAN":
                  "(typeof window !== 'undefined' ? window.__GRAPHILE_APP__.STRIPE_PLAN : process.env.STRIPE_PLAN)",
              }),
              new webpack.IgnorePlugin(
                // These modules are server-side only; we don't want webpack
                // attempting to bundle them into the client.
                /^(node-gyp-build|bufferutil|utf-8-validate)$/
              ),
            ],
            externals: [
              ...(externals || []),
              isServer ? { "pg-native": "pg/lib/client" } : null,
            ].filter((_) => _),
          };
        },
      },
      sentryWebpackPluginOptions,
      sentryOptions
    );
  };
})();
