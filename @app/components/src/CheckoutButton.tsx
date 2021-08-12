import { useStripeCustomerQuery } from "@app/graphql";
import { Button } from "antd";
import React from "react";
import type { Stripe } from "stripe";

import { fetchPostJsonCsrf } from "./util/apiHelpers";
import getStripe from "./util/getStripe";

export const CheckoutButton = () => {
  const { data } = useStripeCustomerQuery();
  const userId = data?.currentUser?.id;
  const userEmail = data?.currentUser?.userEmails.nodes[0].email;
  const stripeCustomerId = data?.currentUser?.stripeCustomer?.id;
  const plan = process.env.NEXT_PUBLIC_STRIPE_PLAN;

  async function redirectToCheckout(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();
    const checkoutSession: Stripe.Checkout.Session = await fetchPostJsonCsrf(
      "/api/checkout_session",
      {
        plan,
        userId,
        userEmail,
        stripeCustomerId,
      }
    );

    if ((checkoutSession as any).statusCode === 500) {
      console.error((checkoutSession as any).message);
      return;
    }

    const stripe = await getStripe();
    const { error } = await stripe!.redirectToCheckout({
      sessionId: checkoutSession.id,
    });
    console.warn(error.message);
  }

  return (
    <Button
      type="primary"
      block
      onClick={redirectToCheckout}
      className="pro price-button"
    >
      Purchase Membership
    </Button>
  );
};
