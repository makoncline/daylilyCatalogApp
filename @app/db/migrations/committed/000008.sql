--! Previous: sha1:c28a218fdbf7c35dde15602f878cf05120eaf7f2
--! Hash: sha1:8f33f2751a708b46c935819171cd9a25a795e3e9

-- Enter migration here
alter table app_public.users drop column if exists img_urls cascade;

alter table app_public.users add column img_urls text[] default '{}';

grant update(img_urls) on app_public.users to :DATABASE_VISITOR;

comment on column app_public.users.img_urls is
  E'Array of profile photos for the `User`';
