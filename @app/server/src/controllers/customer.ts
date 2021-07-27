import { Request, RequestHandler, Response } from "express";
import Stripe from "stripe";

import getStripe from "../utils/getStripe";

export const createCustomerHandler: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { userId, userEmail } = req.body;
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

export const createCustomer = async (userId: string, userEmail: string) => {
  const params: Stripe.CustomerCreateParams = {
    description: `{ user.id: ${userId} }`,
    email: userEmail,
  };
  const stripe = getStripe();
  const customer = stripe.customers.create(params);
  return customer;
};
