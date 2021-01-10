import { Express } from "express";
import helmet from "helmet";

// const isDevOrTest =
//   process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

// bug in next requires unsave-eval in content security policy
// but I just turned it off...
// to turn back on check out the doc below or starter
// Dev needs 'unsafe-eval' due to
// https://github.com/vercel/next.js/issues/14221
export default function installHelmet(app: Express) {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      permittedCrossDomainPolicies: false,
    })
  );
}
