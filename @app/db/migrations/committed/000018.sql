--! Previous: sha1:b254303671bf8f95d9fad353fbcc5cdfee07b415
--! Hash: sha1:9f0838b047948b44bb7543347e62725fa0fc906b

drop policy if exists select_lilies on app_public.lilies;
drop policy if exists select_all on app_public.lilies;
create policy select_all on app_public.lilies for select using (true);
