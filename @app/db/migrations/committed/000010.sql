--! Previous: sha1:446e048c6aad32251590d3a36f559bdf5a90dded
--! Hash: sha1:d36be0e9232e6f631725d7be9ed2fa862155aca3

alter table app_public.lilies drop column if exists ahs_ref;
drop table if exists app_public.ahs_data;

CREATE TABLE app_public.ahs_data(
    id serial primary key,
    ahs_id int not null unique,
    name text,
    hybridizer text,
    year text,
    scape_height text,
    bloom_size text,
    bloom_season text,
    ploidy text,
    foliage_type text,
    bloom_habit text,
    seedling_num text,
    color text,
    form text,
    parentage text,
    image text,
    fragrance text,
    budcount text,
    branches text,
    sculpting text,
    foliage text,
    flower text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table app_public.ahs_data enable row level security;
create index on app_public.ahs_data(ahs_id);

create trigger _100_timestamps before insert or update on app_public.ahs_data for each row execute procedure app_private.tg__timestamps();

grant
  select
on app_public.ahs_data to :DATABASE_VISITOR;

create policy select_all on app_public.ahs_data for select using (true);

comment on table app_public.ahs_data is 'The results of scraping daylilies.org daylily database.';
comment on column app_public.ahs_data.id is 'The primary key for the `AHS Data`.';
comment on column app_public.ahs_data.ahs_id is 'The id of the `AHS Data` from the daylilies.org database.';


alter table app_public.lilies add column ahs_ref int default null references app_public.ahs_data(ahs_id) on delete set null;

grant
  insert (ahs_ref),
  update (ahs_ref)
on table app_public.lilies to :DATABASE_VISITOR;

comment on column app_public.lilies.ahs_ref is 'The primary key for the `AHS Data` this `Lily` references.';

CREATE INDEX ON app_public.lilies(ahs_ref);
