import { Express } from "express";

import { createCheckoutSession } from "../controllers/checkoutSession";
import { createCustomerHandler } from "../controllers/customer";
import { stripeWebhooks } from "../controllers/stripeWebhooks";

export default async function installRoutes(app: Express) {
  app.post("/api/checkout_session", createCheckoutSession);
  app.post("/api/create_customer", createCustomerHandler);
  app.post("/api/webhook", stripeWebhooks);
}
