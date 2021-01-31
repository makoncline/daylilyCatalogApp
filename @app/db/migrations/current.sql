drop table if exists app_public.user_lily_photos;

create table app_public.user_lily_photos (
  id uuid primary key default gen_random_uuid(),
  user_id int not null references app_public.users on delete cascade,
  lily_id int not null references app_public.lilies on delete cascade,
  s3_key text not null,
  created_at timestamptz not null default now()
);
alter table app_public.user_lily_photos enable row level security;
create index on app_public.user_lily_photos (user_id);
create index on app_public.user_lily_photos (lily_id);

grant
  select,
  insert (user_id, lily_id, s3_key),
  delete
on app_public.user_lily_photos to :DATABASE_VISITOR;

create policy select_user_lily_photos on app_public.user_lily_photos for select using (user_id = app_public.current_user_id());
create policy insert_user_lily_photos on app_public.user_lily_photos for insert with check (user_id = app_public.current_user_id());
create policy delete_user_lily_photos on app_public.user_lily_photos for delete using (user_id = app_public.current_user_id());

comment on table app_public.user_lily_photos is 'A photo relevant to a particular `User`.';
comment on column app_public.user_lily_photos.id is 'An identifier for this entry.';
comment on column app_public.user_lily_photos.created_at is 'The time this photo item was added.';
