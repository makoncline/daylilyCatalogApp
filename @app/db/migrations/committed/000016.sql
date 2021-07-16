--! Previous: sha1:8d85de82d3497103916af311f8f18c3594f21d34
--! Hash: sha1:aa9dd8224368d1154370aac1ede23c195e4d147f

drop function if exists search_ahs_lilies;

create function search_ahs_lilies(search text)
  returns setof app_public.ahs_data as $$
    select *
    from app_public.ahs_data
    where
      name ilike (search || '%')
  $$ language sql stable;
