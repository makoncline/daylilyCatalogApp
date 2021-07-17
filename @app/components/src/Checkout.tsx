import React from "react";

import getStripe from "./util/getStripe";

export const Checkout = ({ plan }: { plan: string }) => {
  const stripe = getStripe();

  async function redirectToCheckout(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();
    const { error } =
      (await (
        await stripe
      )?.redirectToCheckout({
        lineItems: [{ price: plan, quantity: 1 }],
        successUrl: `${process.env.ROOT_URL}/success`,
        cancelUrl: `${process.env.ROOT_URL}/cancel`,
        mode: "subscription",
      })) ?? {};
    if (error) {
      console.warn("Error:", error);
    }
  }

  return <button onClick={redirectToCheckout}>checkout</button>;
};
