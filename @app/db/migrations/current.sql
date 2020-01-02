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
