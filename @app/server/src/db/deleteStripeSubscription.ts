import { queryDb } from "./queryDb";

export const deleteStripeSubscription = async (id: string) => {
  try {
    return await queryDb(
      `delete from app_public.stripe_subscriptions where id = $1::text returning id;`,
      [id]
    );
  } catch (err) {
    throw new Error(`deleteStripeSubscription, ${err}`);
  }
};
