--! Previous: sha1:ba78b4afb3e19ab86cb70d6f2fdff132044be11a
--! Hash: sha1:d708dcdc899a7dca32f8258fa497faa33727aded

-- Enter migration here
alter table app_public.users drop constraint users_username_check;

alter table app_public.users add constraint users_username_check check(length(username) >= 2 and length(username) <= 24 and username ~ '^[a-zA-Z]([_]?[a-zA-Z0-9])+$');
