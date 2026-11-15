-- Pappilon: informed-consent storage. Run once in Supabase → SQL editor.
-- Participants can add and read only their own consent record/file; they cannot edit or delete it.
-- Researchers read all records from the Supabase dashboard (Table editor / Storage) or with the service role.

create table if not exists public.sll_consents (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  user_name text,
  consent_version text not null,
  study_title text,
  checks jsonb,                       -- the four agreed statements
  signed_at timestamptz not null default now(),
  form_path text,                     -- file in bucket "consents"
  form_sha256 text,                   -- integrity hash of the stored HTML form
  user_agent text,
  primary key (user_id, consent_version)
);
alter table public.sll_consents enable row level security;
create policy "own consent insert" on public.sll_consents for insert to authenticated with check (user_id = auth.uid());
create policy "own consent read"   on public.sll_consents for select to authenticated using (user_id = auth.uid());

insert into storage.buckets (id, name, public) values ('consents', 'consents', false) on conflict (id) do nothing;
create policy "own consent files insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'consents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own consent files read" on storage.objects for select to authenticated
  using (bucket_id = 'consents' and (storage.foldername(name))[1] = auth.uid()::text);
