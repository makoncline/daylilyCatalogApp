import { gql, makeExtendSchemaPlugin } from "graphile-utils";
import type Stripe from "stripe";

import getStripe from "../utils/getStripe";
const stripe = getStripe();

async function getStripeSubscriptionInfo(
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
        subscriptionInfo: StripeSubscriptionInfo
      }
    `,
    resolvers: {
      StripeSubscription: {
        async subscriptionInfo(
          subscription: Stripe.Response<Stripe.Subscription>
        ) {
          if (subscription.id) {
            try {
              return await getStripeSubscriptionInfo(subscription.id);
            } catch (e) {
              console.error(
                "Error occurred fetching stripe subscription info:"
              );
              console.error(e);
            }
          }
          return null;
        },
      },
    },
  };
});

export default StripeSubscriptionInfoPlugin;
