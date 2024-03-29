import { Button } from "@app/design";
import { useStripeCustomerQuery } from "@app/graphql";
import * as Sentry from "@sentry/nextjs";
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
      if (typeof window !== "undefined") {
        window.location.href = billingPortalSession.url;
      }
    } catch (err: any) {
      console.error(err.message);
      Sentry.captureException(err);
    }
  }

  return (
    <Button styleType="primary" onClick={redirectToBillingPortal}>
      Manage Membership
    </Button>
  );
};
