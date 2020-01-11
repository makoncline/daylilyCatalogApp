--! Previous: sha1:5b622349f88e949be7be6fa8a20fc735f85e2928
--! Hash: sha1:1695a737dc1215278749d21050bfab30f6388d5b

-- Enter migration here
drop table if exists app_public.lilies cascade;

create table app_public.lilies (
  id serial primary key,
  user_id int not null default app_public.current_user_id() references app_public.users,
  name text not null check (char_length(name) < 70),
  img_url text[],
  price decimal(12,2),
  public_note text,
  private_note text,
  ahs_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant
  select,
  insert (name, img_url, price, public_note, private_note, ahs_id),
  update (name, img_url, price, public_note, private_note, ahs_id),
  delete
on table app_public.lilies to :DATABASE_VISITOR;

alter table app_public.lilies enable row level security;

create policy select_lilies on app_public.lilies for select using (user_id = app_public.current_user_id());
create policy insert_lilies on app_public.lilies for insert with check (user_id = app_public.current_user_id());
create policy update_lilies on app_public.lilies for update using (user_id = app_public.current_user_id());
create policy delete_lilies on app_public.lilies for delete using (user_id = app_public.current_user_id());

create trigger _100_timestamps
  before insert or update on app_public.lilies
  for each row
  execute procedure app_private.tg__timestamps();

CREATE INDEX ON app_public.lilies(user_id);
