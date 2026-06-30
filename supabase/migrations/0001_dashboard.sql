-- =============================================================
-- Baboo.id — Skema dashboard user
-- Proyek, file pendukung, dan percakapan dengan Baboo Mandor.
-- Jalankan di Supabase: SQL Editor, atau `supabase db push`.
-- =============================================================

-- ---------- PROJECTS ----------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 120),
  description text,
  status      text not null default 'aktif' check (status in ('aktif', 'arsip', 'selesai')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id);

-- ---------- PROJECT FILES (metadata; file fisik di Storage) ----------
create table if not exists public.project_files (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  name         text not null,
  storage_path text not null,
  size_bytes   bigint not null default 0,
  mime_type    text,
  created_at   timestamptz not null default now()
);

create index if not exists project_files_project_id_idx on public.project_files (project_id);

-- ---------- MESSAGES (chat dengan Baboo Mandor & sub-agent) ----------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  agent      text not null default 'mandor'
             check (agent in ('mandor', 'civil', 'cad', 'architect')),
  content    text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_project_id_idx on public.messages (project_id, created_at);

-- ---------- updated_at trigger untuk projects ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- =============================================================
-- ROW LEVEL SECURITY — tiap user hanya bisa akses datanya sendiri
-- =============================================================
alter table public.projects      enable row level security;
alter table public.project_files enable row level security;
alter table public.messages      enable row level security;

-- projects
drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own" on public.projects
  for select using (auth.uid() = user_id);

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = user_id);

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own" on public.projects
  for update using (auth.uid() = user_id);

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own" on public.projects
  for delete using (auth.uid() = user_id);

-- project_files
drop policy if exists "files_select_own" on public.project_files;
create policy "files_select_own" on public.project_files
  for select using (auth.uid() = user_id);

drop policy if exists "files_insert_own" on public.project_files;
create policy "files_insert_own" on public.project_files
  for insert with check (auth.uid() = user_id);

drop policy if exists "files_delete_own" on public.project_files;
create policy "files_delete_own" on public.project_files
  for delete using (auth.uid() = user_id);

-- messages
drop policy if exists "messages_select_own" on public.messages;
create policy "messages_select_own" on public.messages
  for select using (auth.uid() = user_id);

drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own" on public.messages
  for insert with check (auth.uid() = user_id);

drop policy if exists "messages_delete_own" on public.messages;
create policy "messages_delete_own" on public.messages
  for delete using (auth.uid() = user_id);

-- =============================================================
-- STORAGE — bucket privat untuk file proyek
-- Path konvensi: {user_id}/{project_id}/{filename}
-- =============================================================
insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', false)
on conflict (id) do nothing;

drop policy if exists "project_files_storage_select" on storage.objects;
create policy "project_files_storage_select" on storage.objects
  for select using (
    bucket_id = 'project-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "project_files_storage_insert" on storage.objects;
create policy "project_files_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'project-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "project_files_storage_delete" on storage.objects;
create policy "project_files_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'project-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
