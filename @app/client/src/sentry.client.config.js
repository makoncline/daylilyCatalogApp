import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn:
      SENTRY_DSN ||
      "https://5cf2826fde7e4b14a2c982449e1b8dc6@o1136137.ingest.sentry.io/6188151",
    tracesSampleRate: 0.1,
  });
}
