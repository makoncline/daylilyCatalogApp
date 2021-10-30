import { queryDb } from "./queryDb";

export const saveStripeSubscription = async (
  id: string,
  userId: number,
  customer_id: string
) => {
  try {
    return await queryDb(
      `insert into app_public.stripe_subscriptions (id, user_id, customer_id) values($1::text,$2::int, $3::text) returning id;`,
      [id, userId, customer_id]
    );
  } catch (err) {
    throw new Error(`saveStripeSubscription, ${err}`);
  }
};
