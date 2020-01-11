--! Previous: sha1:4594e065293ddde6e92164a8d2b9e06a63643d0b
--! Hash: sha1:5b622349f88e949be7be6fa8a20fc735f85e2928

-- Enter migration here
alter table app_public.lilies
  drop column if exists img_url,
  add column img_url text[];

grant
  select,
  insert (img_url),
  update (img_url),
  delete
on table app_public.lilies to :DATABASE_VISITOR;
