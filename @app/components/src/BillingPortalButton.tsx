import { Button } from "@app/design";
import { useStripeCustomerQuery } from "@app/graphql";
import React from "react";
import type { Stripe } from "stripe";

import { fetchPostJsonCsrf } from "./util/apiHelpers";

export const BillingPortalButton = () => {
  const { data } = useStripeCustomerQuery();
  const stripeCustomerId = data?.currentUser?.stripeCustomer?.id;

  async function redirectToBillingPortal(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();
    try {
      const billingPortalSession: Stripe.BillingPortal.Session =
        await fetchPostJsonCsrf("/api/billing_portal_session", {
          stripeCustomerId,
        });
      console.log(billingPortalSession);
      if (typeof window !== "undefined") {
        window.location.href = billingPortalSession.url;
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  return (
    <Button type="primary" block onClick={redirectToBillingPortal}>
      Manage Membership
    </Button>
  );
};
