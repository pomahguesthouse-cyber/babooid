-- =============================================================
-- 0007 — Folder pengelompokan Knowledge (satu tingkat, per agent)
-- File-explorer sederhana: folder di root, knowledge bisa masuk folder.
-- =============================================================

-- ---------- Tabel folder ----------
create table if not exists public.ai_knowledge_folders (
  id         uuid primary key default gen_random_uuid(),
  agent_id   uuid not null references public.ai_agents (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_knowledge_folders_agent_id_idx
  on public.ai_knowledge_folders (agent_id);

-- Nama folder unik per agent (case-insensitive)
create unique index if not exists ai_knowledge_folders_agent_name_idx
  on public.ai_knowledge_folders (agent_id, lower(name));

-- ---------- Relasi knowledge -> folder (null = root) ----------
alter table public.ai_knowledge
  add column if not exists folder_id uuid
  references public.ai_knowledge_folders (id) on delete set null;

create index if not exists ai_knowledge_folder_id_idx
  on public.ai_knowledge (folder_id);

-- ---------- Trigger updated_at ----------
drop trigger if exists ai_knowledge_folders_set_updated_at on public.ai_knowledge_folders;
create trigger ai_knowledge_folders_set_updated_at
  before update on public.ai_knowledge_folders
  for each row execute function public.set_updated_at();

-- ---------- RLS admin-only (mengikuti pola tabel AI Lab lain) ----------
alter table public.ai_knowledge_folders enable row level security;

drop policy if exists "ai_knowledge_folders_admin_all" on public.ai_knowledge_folders;
create policy "ai_knowledge_folders_admin_all" on public.ai_knowledge_folders
  for all using (public.is_admin()) with check (public.is_admin());
