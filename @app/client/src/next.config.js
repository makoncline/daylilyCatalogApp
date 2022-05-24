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
  // comment to trigger build
  sentryDisabled = true;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
(function (process = null) {
  // You *must not* use `process.env` in here, because we need to check we have
  // those variables. To enforce this, we've deliberately shadowed process.
  module.exports = () => {
    const { withSentryConfig } = require("@sentry/nextjs");
    const sentryWebpackPluginOptions = {
      // Additional config options for the Sentry Webpack plugin. Keep in mind that
      // the following options are set automatically, and overriding them is not
      // recommended:
      //   release, url, org, project, authToken, configFile, stripPrefix,
      //   urlPrefix, include, ignore

      silent: true, // Suppresses all logs
      // For all available options, see:
      // https://github.com/getsentry/sentry-webpack-plugin#options.
    };

    return withSentryConfig(
      {
        sentry: {
          disableServerWebpackPlugin: sentryDisabled,
          disableClientWebpackPlugin: sentryDisabled,
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
          ],
          minimumCacheTTL: 3600,
          deviceSizes: [200, 800],
          imageSizes: [16, 200, 800],
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
      sentryWebpackPluginOptions
    );
  };
})();
