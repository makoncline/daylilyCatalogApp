import {
  StripeCustomerDocument,
  useCreateStripeCustomerMutation,
  useStripeCustomerQuery,
} from "@app/graphql";
import { check } from "prettier";
import React from "react";
import type { Stripe } from "stripe";

import { fetchPostJsonCsrf } from "./util/apiHelpers";
import getStripe from "./util/getStripe";

export const Checkout = ({ plan }: { plan: string }) => {
  const [createStripeCustomer] = useCreateStripeCustomerMutation();
  const { data } = useStripeCustomerQuery();
  const userId = data?.currentUser?.id;
  const userEmail = data?.currentUser?.userEmails.nodes[0].email;
  const stripeCustomerId = data?.currentUser?.stripeCustomer?.stripeId;
  console.log(data);

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
    const customer = checkoutSession.customer?.toString();
    if (!stripeCustomerId && customer) {
      try {
        await createStripeCustomer({
          variables: {
            stripeId: customer,
          },
        });
      } catch (err) {
        console.error(err.message);
      }
    }
    console.log("checkoutSession: ", checkoutSession);

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

  return <button onClick={redirectToCheckout}>checkout</button>;
};
