import * as Sentry from "@sentry/nextjs";

import { sentryDataCollection } from "./sentry-options";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (process.env.NODE_ENV === "production" && dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    dataCollection: sentryDataCollection,
  });
}
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
