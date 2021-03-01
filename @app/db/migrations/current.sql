drop table if exists app_public.user_lily_photos;

create table app_public.user_lily_photos (
  id text primary key,
  user_id int not null references app_public.users default app_public.current_user_id(),
  lily_id int not null references app_public.lilies,
  created_at timestamptz not null default now()
);
alter table app_public.user_lily_photos enable row level security;
create index on app_public.user_lily_photos (id);
create index on app_public.user_lily_photos (user_id);
create index on app_public.user_lily_photos (lily_id);

grant
  select,
  insert (id, lily_id),
  delete
on app_public.user_lily_photos to :DATABASE_VISITOR;

create policy select_user_lily_photos on app_public.user_lily_photos for select using (user_id = app_public.current_user_id());
create policy insert_user_lily_photos on app_public.user_lily_photos for insert with check (user_id = app_public.current_user_id());
create policy delete_user_lily_photos on app_public.user_lily_photos for delete using (user_id = app_public.current_user_id());

comment on table app_public.user_lily_photos is 'A photo of a `Lily` added by `User`.';
comment on column app_public.user_lily_photos.id is 'The s3 id the photo is saved at';
comment on column app_public.user_lily_photos.created_at is 'The time this photo item was added.';
