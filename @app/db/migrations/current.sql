-- Enter migration here
alter table app_public.users drop constraint users_username_check;

alter table app_public.users add constraint users_username_check check(length(username) >= 2 and length(username) <= 24 and username ~ '^[a-zA-Z]([_]?[a-zA-Z0-9])+$');
