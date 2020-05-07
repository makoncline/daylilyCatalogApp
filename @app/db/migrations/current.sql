-- Enter migration here
begin;
ALTER TABLE app_public.lilies
DROP CONSTRAINT lilies_user_id_fkey;

ALTER TABLE app_public.lilies
ADD CONSTRAINT lilies_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES app_public.users (id)
ON DELETE CASCADE;

commit;
