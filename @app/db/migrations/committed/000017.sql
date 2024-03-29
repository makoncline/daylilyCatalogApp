--! Previous: sha1:aa9dd8224368d1154370aac1ede23c195e4d147f
--! Hash: sha1:b254303671bf8f95d9fad353fbcc5cdfee07b415

drop table if exists app_public.stripe_subscriptions;
drop table if exists app_public.stripe_customers;

create table app_public.stripe_customers (
  id text primary key,
  user_id int not null default app_public.current_user_id() references app_public.users on delete cascade unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on app_public.stripe_customers(user_id);

create trigger _100_timestamps
  before insert or update on app_public.stripe_customers
  for each row
  execute procedure app_private.tg__timestamps();

alter table app_public.stripe_customers enable row level security;

create policy select_all on app_public.stripe_customers for select using (true);
create policy insert_self on app_public.stripe_customers for insert with check (user_id = app_public.current_user_id());
create policy update_self on app_public.stripe_customers for update using (user_id = app_public.current_user_id());
create policy delete_self on app_public.stripe_customers for delete using (user_id = app_public.current_user_id());

grant
  select,
  insert,
  update,
  delete
on table app_public.stripe_customers to :DATABASE_VISITOR;

create table app_public.stripe_subscriptions (
  id text primary key,
  user_id int not null default app_public.current_user_id() references app_public.users on delete cascade unique,
  customer_id text not null references app_public.stripe_customers on delete cascade unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on app_public.stripe_subscriptions(user_id);
create index on app_public.stripe_subscriptions(customer_id);

create trigger _100_timestamps
  before insert or update on app_public.stripe_subscriptions
  for each row
  execute procedure app_private.tg__timestamps();

alter table app_public.stripe_subscriptions enable row level security;

create policy select_all on app_public.stripe_subscriptions for select using (true);
create policy insert_self on app_public.stripe_subscriptions for insert with check (user_id = app_public.current_user_id());
create policy update_self on app_public.stripe_subscriptions for update using (user_id = app_public.current_user_id());
create policy delete_self on app_public.stripe_subscriptions for delete using (user_id = app_public.current_user_id());

grant
  select,
  insert,
  update,
  delete
on table app_public.stripe_subscriptions to :DATABASE_VISITOR;

alter table if exists app_public.users
drop column if exists free_until;

alter table app_public.users
add column free_until timestamptz;
