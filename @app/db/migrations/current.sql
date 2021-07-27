drop table if exists app_public.stripe_customers;

create table app_public.stripe_customers (
  -- user_id int not null primary key references app_public.users on delete cascade,
  user_id int not null primary key default app_public.current_user_id() references app_public.users on delete cascade,
  stripe_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  update (stripe_id),
  delete
on table app_public.stripe_customers to :DATABASE_VISITOR;


