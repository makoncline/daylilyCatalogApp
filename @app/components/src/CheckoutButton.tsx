import { Button } from "@app/design";
import { useStripeCustomerQuery } from "@app/graphql";
import { useRouter } from "next/router";
import React from "react";
import type { Stripe } from "stripe";

import { getStripe } from "./util";
import { fetchPostJsonCsrf } from "./util/apiHelpers";

export const CheckoutButton = () => {
  const { data } = useStripeCustomerQuery();
  const userId = data?.currentUser?.id;
  const userEmail = data?.currentUser?.userEmails?.nodes[0]?.email;
  const stripeCustomerId = data?.currentUser?.stripeCustomer?.id;
  // TODO: revert hardcode prod plan since it is undefined in prod only for some reason
  const plan =
    process.env.NEXT_PUBLIC_STRIPE_PLAN !== "undefined"
      ? process.env.NEXT_PUBLIC_STRIPE_PLAN
      : "price_1JetCGEojuAWz3ApRn8aEB86";
  const router = useRouter();
  const hasPrimaryEmail = !!userEmail;

  async function redirectToCheckout(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();
    const checkoutSession: Stripe.Checkout.Session = await fetchPostJsonCsrf(
      "/api/checkout_session",
      {
        plan: "price_1JetCGEojuAWz3ApRn8aEB86",
        userId,
        userEmail,
        stripeCustomerId,
      }
    );

    if ((checkoutSession as any).statusCode === 500) {
      console.error((checkoutSession as any).message);
      router.reload();
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
      styleType="primary"
      block
      onClick={redirectToCheckout}
      className="pro price-button"
      disabled={!hasPrimaryEmail}
      data-cy="checkout"
    >
      Purchase Membership
    </Button>
  );
};
