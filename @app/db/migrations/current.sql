-- Enter migration here
grant
  select,
  insert,
  update,
  delete
on table app_public.lilies to :DATABASE_VISITOR;
