import { Request, RequestHandler, Response } from "express";
import Stripe from "stripe";

import { saveStripeSubscription } from "../db";
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
        // required
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: plan, quantity: 1 }],
        // success_url: `${process.env.ROOT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        success_url: `${process.env.ROOT_URL}/membership`,
        cancel_url: `${process.env.ROOT_URL}/membership`,
        // optional
        client_reference_id: userId,
        metadata: { userEmail: userEmail },
      };
      if (stripeCustomerId) {
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: "active",
          limit: 1,
        });
        const hasActiveSubscription = subscriptions.data.length > 0;
        if (hasActiveSubscription) {
          const activeSubscriptionId = subscriptions.data[0].id;
          saveStripeSubscription(
            activeSubscriptionId,
            userId,
            stripeCustomerId
          );
          res
            .status(500)
            .json({
              statusCode: 500,
              message:
                "Customer already has active subscription. Saving it to db. Try refreshing.",
            });
        }
        params.customer = stripeCustomerId;
      } else {
        try {
          const stripeCustomer = await createCustomer(userId, userEmail);
          const stripeId = stripeCustomer.id;
          params.customer = stripeId;
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
