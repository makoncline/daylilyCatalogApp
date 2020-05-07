--! Previous: sha1:1695a737dc1215278749d21050bfab30f6388d5b
--! Hash: sha1:09c9778e2e60da2fa10720045f883637676b752e

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
