--! Previous: sha1:291d72f6d02f5e522ae77d2176858ca1a69adc03
--! Hash: sha1:8d85de82d3497103916af311f8f18c3594f21d34

-- Enter migration here
alter table app_public.lilies drop column if exists ahs_ref;
alter table app_public.lilies
add column ahs_ref int generated always as (cast(ahs_id as int)) stored references app_public.ahs_data(ahs_id) on delete no action;

grant select on table app_public.lilies to :DATABASE_VISITOR;

comment on column app_public.lilies.ahs_ref is 'The primary key for the `AHS Data` this `Lily` references.';

CREATE INDEX ON app_public.lilies(ahs_ref);
