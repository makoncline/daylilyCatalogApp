import { Request, RequestHandler, Response } from "express";
import Stripe from "stripe";

import getStripe from "../utils/getStripe";
import { createCustomer } from "./customer";

export const createCheckoutSession: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { plan, userId, userEmail, stripeCustomerId } = req.body;
  if (req.method === "POST") {
    if (!plan || !userId || !userEmail) {
      res.status(400).json({
        statusCode: 400,
        message: `request missing required parameter, {plan: ${plan}, customer_email: ${userEmail}}`,
      });
    } else {
      const stripe = getStripe();
      const params: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        line_items: [{ price: plan, quantity: 1 }],
        success_url: `${process.env.ROOT_URL}/success`,
        cancel_url: `${process.env.ROOT_URL}/cancel`,
        mode: "subscription",
      };
      if (stripeCustomerId) {
        params.customer = stripeCustomerId;
      } else {
        try {
          const stripeCustomer = await createCustomer(userId, userEmail);
          params.customer = stripeCustomer.id;
        } catch (err) {
          res.status(500).json({ statusCode: 500, message: err.message });
        }
      }
      try {
        const checkoutSession = await stripe.checkout.sessions.create(params);
        res.status(200).json(checkoutSession);
      } catch (err) {
        res.status(500).json({ statusCode: 500, message: err.message });
      }
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};
