--! Previous: sha1:9f0838b047948b44bb7543347e62725fa0fc906b
--! Hash: sha1:65ac8ea123fc8ced631c1ecdf1afcc1806b41e0e

drop policy if exists insert_admin on app_public.ahs_data;
drop function if exists app_public.current_user_is_admin();

create function app_public.current_user_is_admin() returns boolean as $$
  select is_admin from app_public.current_user();
$$ language sql stable security definer set search_path from current;
comment on function app_public.current_user_is_admin() is
  E'Check if the current user is an admin for use in RLS policies, etc;';

create policy insert_admin on app_public.ahs_data for insert with check (app_public.current_user_is_admin() = true);

grant
  insert
on app_public.ahs_data to :DATABASE_VISITOR;
