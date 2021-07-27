/* e.g.
create table app_public.plans (
  id int primary key,
  name varchar(256) not null,
  source varchar(16) not null default 'stripe',
  identifier varchar(16) not null default 'my-plan-id'
);
*/
import { gql, makeExtendSchemaPlugin } from "graphile-utils";

import getStripe from "../utils/getStripe";

function isError(err: any) {
  return err instanceof Error;
}

const FIVE_MINUTES = 5 * 60 * 1000;

const planCache = {};
async function getStripePlanInfo(planId: string) {
  const stripe = getStripe();
  // Time out errors after 5 minutes
  if (
    isError(planCache[planId]) &&
    planCache[planId]._timestamp < Date.now() - FIVE_MINUTES
  ) {
    delete planCache[planId];
  }
  if (!planCache[planId]) {
    try {
      const plan = await stripe.plans.retrieve(planId);
      planCache[planId] = plan;
    } catch (e) {
      e._timestamp = Date.now();
      planCache[planId] = e;
    }
  }
  if (isError(planCache[planId])) {
    throw new Error("Could not find plan in Stripe, try again after 5 minutes");
  }
  return planCache[planId];
}

module.exports = makeExtendSchemaPlugin(() => ({
  typeDefs: gql`
    type StripePlanInfo @scope(isStripePlanInfo: true) {
      amount: Int!
      currency: String!
      interval: String!
      intervalCount: Int!
    }
    extend type Plan {
      planInfo: StripePlanInfo
        @requires(columns: ["source", "identifier"])
        @scope(isStripePlanInfoField: true)
    }
  `,
  resolvers: {
    StripePlanInfo: {
      intervalCount: (plan) => plan.interval_count,
    },
    Plan: {
      async planInfo(plan, _args, _context) {
        if (plan.source === "stripe") {
          try {
            return await getStripePlanInfo(plan.identifier);
          } catch (e) {
            console.error("Error occurred fetching stripe plan info:");
            console.error(e);
          }
        }
        return null;
      },
    },
  },
}));
