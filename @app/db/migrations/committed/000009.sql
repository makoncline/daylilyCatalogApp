--! Previous: sha1:8f33f2751a708b46c935819171cd9a25a795e3e9
--! Hash: sha1:446e048c6aad32251590d3a36f559bdf5a90dded

-- Enter migration here
alter table app_public.lilies drop column if exists list_id;
drop table if exists app_public.lists;

create table app_public.lists (
id serial primary key,
user_id int not null default app_public.current_user_id() references app_public.users,
name text not null check (char_length(name) < 70),
intro text check (char_length(intro) < 280) default null,
bio text default null,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
);

alter table app_public.lists enable row level security;
create index on app_public.lists (user_id);

create trigger _100_timestamps before insert or update on app_public.lists for each row execute procedure app_private.tg__timestamps();

grant
  select,
  insert (name, intro, bio),
  update (name, intro, bio),
  delete
on app_public.lists to :DATABASE_VISITOR;

create policy select_all on app_public.lists for select using (true);
create policy manage_own on app_public.lists for all using (user_id = app_public.current_user_id());
create policy manage_as_admin on app_public.lists for all using (exists (select 1 from app_public.users where is_admin is true and id = app_public.current_user_id()));

comment on table app_public.lists is 'A list of lilies.';
comment on column app_public.lists.id is 'The primary key for the `List`.';
comment on column app_public.lists.user_id is 'The id of the `User`.';
comment on column app_public.lists.name is 'The name of the `List` written by the `User`.';
comment on column app_public.lists.intro is 'A short introduction for the `List` written by the `User`.';
comment on column app_public.lists.bio is 'A long bio for the `List` written by the `User`.';
comment on column app_public.lists.created_at is 'The time this `List` was created.';
comment on column app_public.lists.updated_at is 'The time this `List` was last modified (or created).';


alter table app_public.lilies add column list_id int default null references app_public.lists(id) on delete set null;

grant
  insert (list_id),
  update (list_id)
on table app_public.lilies to :DATABASE_VISITOR;

comment on column app_public.lilies.list_id is 'The primary key for the `List` this `Lily` belongs to.';

CREATE INDEX ON app_public.lilies(list_id);
