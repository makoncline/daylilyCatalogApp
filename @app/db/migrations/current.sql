-- Enter migration here
alter table app_public.lilies
  alter column img_url type text array;

