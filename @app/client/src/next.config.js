require("@app/config");
require("sharp");
const { withSentryConfig } = require("@sentry/nextjs/config");

if (!process.env.ROOT_URL) throw new Error("ROOT_URL is a required envvar");

const imageHosts = [
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
];

module.exports = withSentryConfig(
  {
    async rewrites() {
      return [{ source: "/sitemap.xml", destination: "/api/sitemap" }];
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
    images: {
      remotePatterns: imageHosts.map((hostname) => ({ hostname })),
      minimumCacheTTL: 3600,
      deviceSizes: [200, 400, 800],
      imageSizes: [16, 100],
    },
    poweredByHeader: false,
    distDir: "../.next",
    transpilePackages: [
      "@app/components",
      "@app/design",
      "@app/graphql",
      "@app/lib",
    ],
    webpack(config, { webpack }) {
      const publicRuntimeValues = [
        "ROOT_URL",
        "T_AND_C_URL",
        "S3_UPLOAD_BUCKET",
        "S3_RESIZED_IMAGE_BUCKET",
        "STRIPE_PUBLISHABLE_KEY",
        "STRIPE_PLAN",
      ];
      const definitions = Object.fromEntries(
        publicRuntimeValues.map((name) => [
          `process.env.${name}`,
          `(typeof window !== 'undefined' ? window.__GRAPHILE_APP__.${name} : process.env.${name})`,
        ])
      );
      config.plugins.push(
        new webpack.DefinePlugin(definitions),
        new webpack.IgnorePlugin({
          resourceRegExp:
            /^(node-gyp-build|bufferutil|utf-8-validate|pg-native)$/,
        })
      );
      return config;
    },
  },
  {
    silent: true,
    sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  }
);
