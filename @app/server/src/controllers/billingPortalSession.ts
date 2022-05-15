import { Request, RequestHandler, Response } from "express";
import Stripe from "stripe";

import { getStripe } from "../utils";

export const createBillingPortalSession: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { stripeCustomerId } = req.body;
  if (req.method === "POST") {
    if (!stripeCustomerId) {
      res.status(400).json({
        statusCode: 400,
        message: `request missing required parameter, {stripeCustomerId: ${stripeCustomerId}}`,
      });
    } else {
      const stripe = getStripe();
      const params: Stripe.BillingPortal.SessionCreateParams = {
        customer: stripeCustomerId,
        return_url: `${process.env.ROOT_URL}/membership`,
      };
      try {
        const billingPortalSession = await stripe.billingPortal.sessions.create(
          params
        );
        res.status(200).json(billingPortalSession);
      } catch (err) {
        res.status(500).json({ statusCode: 500, message: err.message });
      }
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};
