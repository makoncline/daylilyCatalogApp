--! Previous: sha1:0ee1cadbb25aa69df297e8c5c04ee79bf5871054
--! Hash: sha1:ba78b4afb3e19ab86cb70d6f2fdff132044be11a

-- Enter migration here
drop trigger if exists _200_make_first_user_admin on app_public.users;
