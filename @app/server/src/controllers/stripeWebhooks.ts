import { Request, Response } from "express";

import { deleteStripeSubscription, saveStripeSubscription } from "../db";
import { getStripe } from "../utils";
// import { createCustomer } from "./customer";

export const stripeWebhooks = async (req: Request, res: Response) => {
  const stripe = getStripe();
  let data;
  let eventType;
  // Check if webhook signing is configured.
  const webhookSecret = `${process.env.STRIPE_WEBHOOK_SECRET}`;

  if (webhookSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"]!;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  switch (eventType) {
    case "checkout.session.completed":
      {
        // Payment is successful and the subscription is created.
        // You should provision the subscription and save the customer ID to your database.
        const { customer, subscription, client_reference_id } =
          data.object ?? {};
        if (!customer || !subscription || !client_reference_id) {
          res.status(400).json({
            statusCode: 400,
            message: `request missing required parameter, {customer: ${customer}, subscription: ${subscription}, client_reference_id: ${client_reference_id}}`,
          });
          return;
        }
        try {
          await saveStripeSubscription(
            subscription,
            client_reference_id,
            customer
          );
        } catch (err) {
          res.status(500).json({ statusCode: 500, message: err.message });
        }
      }
      break;
    case "customer.subscription.deleted":
      {
        const { id: subscription } = data.object ?? {};
        if (!subscription) {
          res.status(400).json({
            statusCode: 400,
            message: `request missing required parameter, {subscription: ${subscription}}`,
          });
          return;
        }
        try {
          await deleteStripeSubscription(subscription);
        } catch (err) {
          res.status(500).json({ statusCode: 500, message: err.message });
        }
      }
      break;
    case "invoice.paid":
      // Continue to provision the subscription as payments continue to be made.
      // Store the status in your database and check when a user accesses your service.
      // This approach helps you avoid hitting rate limits.
      break;
    case "invoice.payment_failed":
      // The payment failed or the customer does not have a valid payment method.
      // The subscription becomes past_due. Notify your customer and send them to the
      // customer portal to update their payment information.
      break;
    default:
    // Unhandled event type
  }

  res.sendStatus(200);
};

// checkout.session.completed = {
//   id: "cs_test_a1JN2wd0n3xzvEUAettybKla991rr1fb9I8lSwgl3VDVLGIyJIqKB7xnaL",
//   object: "checkout.session",
//   allow_promotion_codes: null,
//   amount_subtotal: 999,
//   amount_total: 999,
//   automatic_tax: { enabled: false, status: null },
//   billing_address_collection: null,
//   cancel_url: "http://localhost:5678/cancel",
//   client_reference_id: null,
//   currency: "usd",
//   customer: "cus_JvXx8tdU5x2SWe",
//   customer_details: {
//     email: "Example@DaylilyCatalog.com",
//     tax_exempt: "none",
//     tax_ids: [],
//   },
//   customer_email: null,
//   livemode: false,
//   locale: null,
//   metadata: {},
//   mode: "subscription",
//   payment_intent: null,
//   payment_method_options: {},
//   payment_method_types: ["card"],
//   payment_status: "paid",
//   setup_intent: null,
//   shipping: null,
//   shipping_address_collection: null,
//   submit_type: null,
//   subscription: "sub_JwGF4LJb0vtTgV",
//   success_url: "http://localhost:5678/success",
//   total_details: { amount_discount: 0, amount_shipping: 0, amount_tax: 0 },
//   url: null,
// };
