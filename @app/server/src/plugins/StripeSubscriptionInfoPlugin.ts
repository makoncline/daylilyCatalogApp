import { gql, makeExtendSchemaPlugin } from "graphile-utils";
import type Stripe from "stripe";

import { getStripe } from "../utils";
const stripe = getStripe();

export async function getStripeSubscriptionInfo(
  subscriptionId: string
): Promise<Stripe.Response<Stripe.Subscription> | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (e) {
    throw e;
  }
}

const StripeSubscriptionInfoPlugin = makeExtendSchemaPlugin(() => {
  return {
    typeDefs: gql`
      type StripeSubscriptionInfo @scope(isStripeSubscriptionInfo: true) {
        status: String!
      }
      extend type StripeSubscription {
        subscriptionInfo: StripeSubscriptionInfo @requires(columns: ["id"])
      }
    `,
    resolvers: {
      StripeSubscription: {
        async subscriptionInfo(
          subscription: Stripe.Response<Stripe.Subscription>
        ) {
          const { id } = subscription;
          try {
            return await getStripeSubscriptionInfo(id);
          } catch (e) {
            console.error("Error occurred fetching stripe subscription info:");
            console.error(e);
          }
        },
      },
    },
  };
});

export default StripeSubscriptionInfoPlugin;
