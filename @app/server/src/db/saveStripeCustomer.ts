import { queryDb } from "./queryDb";

export const saveStripeCustomer = async (id: string, userId: number) => {
  try {
    return await queryDb(
      `insert into app_public.stripe_customers (id, user_id) values('${id}',${userId}) returning id;`
    );
  } catch (err) {
    throw new Error(`saveStripeCustomer, ${err}`);
  }
};
