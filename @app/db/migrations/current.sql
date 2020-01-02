-- Enter migration here
alter table app_public.lilies
  drop column if exists img_url,
  add column img_url text[];

