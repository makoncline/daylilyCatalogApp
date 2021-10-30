import { Request, RequestHandler, Response } from "express";
import Stripe from "stripe";

import { saveStripeCustomer } from "../db/saveStripeCustomer";
import getStripe from "../utils/getStripe";

export const createCustomerHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { userId, userEmail }: { userId: number; userEmail: string } = req.body;
  if (req.method === "POST") {
    if (!userId || !userEmail) {
      res.status(400).json({
        statusCode: 400,
        message: `request missing required parameter, {userId: ${userId}, customer_email: ${userEmail}}`,
      });
    } else {
      try {
        const customer = await createCustomer(userId, userEmail);
        res.status(200).json(customer);
      } catch (err) {
        res.status(500).json({ statusCode: 500, message: err.message });
      }
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export const createCustomer = async (userId: number, userEmail: string) => {
  const stripe = getStripe();
  const params: Stripe.CustomerCreateParams = {
    description: `{ user.id: ${userId} }`,
    email: userEmail,
  };
  const customer = await stripe.customers.create(params);
  const stripeId = customer.id;
  await saveStripeCustomer(stripeId, userId);
  return customer;
};
