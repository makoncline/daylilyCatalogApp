--! Previous: sha1:d708dcdc899a7dca32f8258fa497faa33727aded
--! Hash: sha1:291d72f6d02f5e522ae77d2176858ca1a69adc03

alter table app_public.lilies drop column if exists ahs_ref;
alter table app_public.lilies
add column ahs_ref int generated always as (cast(ahs_id as int)) stored;
