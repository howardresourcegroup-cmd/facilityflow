-- Roomward — Migration 011
-- Newsletter signups from the public blog. Inserts are open to the anon key
-- (that's the point of the form); reads are NOT exposed through the API — view
-- the list in the Supabase dashboard (or export from there).

create table if not exists newsletter_signups (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  source      text default 'blog',
  created_at  timestamptz default now()
);

alter table newsletter_signups enable row level security;

drop policy if exists "public subscribe" on newsletter_signups;
create policy "public subscribe" on newsletter_signups
  for insert to anon, authenticated with check (true);
-- no select/update/delete policies → the API can write but never read the list
