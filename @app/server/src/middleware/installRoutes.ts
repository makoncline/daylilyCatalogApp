import { Express } from "express";

import { createCheckoutSession } from "../controllers/checkoutSession";
import { createCustomerHandler } from "../controllers/customer";

export default async function installRoutes(app: Express) {
  app.post("/api/checkout_session", createCheckoutSession);
  app.post("/api/create_customer", createCustomerHandler);
}
