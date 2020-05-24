--! Previous: sha1:09c9778e2e60da2fa10720045f883637676b752e
--! Hash: sha1:c28a218fdbf7c35dde15602f878cf05120eaf7f2

alter table app_public.users drop column if exists intro cascade;
alter table app_public.users drop column if exists bio cascade;
alter table app_public.users drop column if exists user_location cascade;

alter table app_public.users add column
intro text check (char_length(intro) < 280);

alter table app_public.users add column
bio text;

alter table app_public.users add column
user_location text check (char_length(user_location) < 140);

grant update(username, name, avatar_url, intro, bio, user_location) on app_public.users to :DATABASE_VISITOR;

comment on column app_public.users.intro is
  E'A short introduction for the user.';
comment on column app_public.users.bio is
  E'A markdown text bio for the user.';
comment on column app_public.users.user_location is
  E'A location for the user.';
