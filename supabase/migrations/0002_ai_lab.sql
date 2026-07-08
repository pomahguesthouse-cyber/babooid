-- =============================================================
-- Baboo.id — AI Lab (admin-only)
-- Agent specialist, training, tools, dan pustaka knowledge.
-- Jalankan di Supabase: SQL Editor, atau `supabase db push`.
-- =============================================================

-- ---------- ADMINS ----------
-- Daftarkan admin pertama secara manual:
--   insert into public.admins (user_id) values ('<uuid-user-anda>');
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Fungsi cek admin (security definer agar bisa dipakai di RLS tanpa rekursi)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "admins_select_self_or_admin" on public.admins;
create policy "admins_select_self_or_admin" on public.admins
  for select using (auth.uid() = user_id or public.is_admin());

-- ---------- AI AGENTS ----------
create table if not exists public.ai_agents (
  id            uuid primary key default gen_random_uuid(),
  key           text not null unique check (key ~ '^[a-z0-9-]{2,40}$'),
  name          text not null check (char_length(name) between 1 and 80),
  role          text not null default '',
  description   text,
  system_prompt text not null default '',
  model         text not null default 'claude-sonnet-4-5',
  temperature   numeric not null default 0.7 check (temperature between 0 and 2),
  status        text not null default 'draft' check (status in ('draft', 'aktif', 'nonaktif')),
  accent        text not null default 'bg-mint text-navy-deep',
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- AI TOOLS ----------
create table if not exists public.ai_tools (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 80),
  description text,
  type        text not null default 'fungsi' check (type in ('fungsi', 'api', 'mcp')),
  config      jsonb not null default '{}'::jsonb,
  enabled     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Relasi agent <-> tool
create table if not exists public.ai_agent_tools (
  agent_id   uuid not null references public.ai_agents (id) on delete cascade,
  tool_id    uuid not null references public.ai_tools (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (agent_id, tool_id)
);

-- ---------- PUSTAKA KNOWLEDGE (per agent) ----------
create table if not exists public.ai_knowledge (
  id           uuid primary key default gen_random_uuid(),
  agent_id     uuid not null references public.ai_agents (id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 160),
  source_type  text not null default 'teks' check (source_type in ('teks', 'file', 'url')),
  content      text,
  url          text,
  storage_path text,
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists ai_knowledge_agent_id_idx on public.ai_knowledge (agent_id);

-- ---------- TRAINING ----------
-- Contoh pasangan input/output untuk melatih perilaku agent
create table if not exists public.ai_training_examples (
  id           uuid primary key default gen_random_uuid(),
  agent_id     uuid not null references public.ai_agents (id) on delete cascade,
  user_input   text not null,
  ideal_output text not null,
  notes        text,
  created_at   timestamptz not null default now()
);

create index if not exists ai_training_examples_agent_id_idx
  on public.ai_training_examples (agent_id);

-- Riwayat sesi training
create table if not exists public.ai_training_runs (
  id          uuid primary key default gen_random_uuid(),
  agent_id    uuid not null references public.ai_agents (id) on delete cascade,
  name        text not null,
  status      text not null default 'antre' check (status in ('antre', 'berjalan', 'selesai', 'gagal')),
  metrics     jsonb not null default '{}'::jsonb,
  notes       text,
  created_at  timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists ai_training_runs_agent_id_idx
  on public.ai_training_runs (agent_id, created_at desc);

-- ---------- updated_at triggers ----------
drop trigger if exists ai_agents_set_updated_at on public.ai_agents;
create trigger ai_agents_set_updated_at
  before update on public.ai_agents
  for each row execute function public.set_updated_at();

drop trigger if exists ai_tools_set_updated_at on public.ai_tools;
create trigger ai_tools_set_updated_at
  before update on public.ai_tools
  for each row execute function public.set_updated_at();

drop trigger if exists ai_knowledge_set_updated_at on public.ai_knowledge;
create trigger ai_knowledge_set_updated_at
  before update on public.ai_knowledge
  for each row execute function public.set_updated_at();

-- =============================================================
-- RLS — semua tabel AI Lab hanya untuk admin
-- =============================================================
alter table public.ai_agents            enable row level security;
alter table public.ai_tools             enable row level security;
alter table public.ai_agent_tools       enable row level security;
alter table public.ai_knowledge         enable row level security;
alter table public.ai_training_examples enable row level security;
alter table public.ai_training_runs     enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'ai_agents', 'ai_tools', 'ai_agent_tools',
    'ai_knowledge', 'ai_training_examples', 'ai_training_runs'
  ] loop
    execute format('drop policy if exists "%s_admin_all" on public.%I', t, t);
    execute format(
      'create policy "%s_admin_all" on public.%I for all using (public.is_admin()) with check (public.is_admin())',
      t, t
    );
  end loop;
end $$;

-- =============================================================
-- STORAGE — bucket privat untuk file knowledge (admin-only)
-- Path konvensi: {agent_id}/{filename}
-- =============================================================
insert into storage.buckets (id, name, public)
values ('ai-knowledge', 'ai-knowledge', false)
on conflict (id) do nothing;

drop policy if exists "ai_knowledge_storage_select" on storage.objects;
create policy "ai_knowledge_storage_select" on storage.objects
  for select using (bucket_id = 'ai-knowledge' and public.is_admin());

drop policy if exists "ai_knowledge_storage_insert" on storage.objects;
create policy "ai_knowledge_storage_insert" on storage.objects
  for insert with check (bucket_id = 'ai-knowledge' and public.is_admin());

drop policy if exists "ai_knowledge_storage_delete" on storage.objects;
create policy "ai_knowledge_storage_delete" on storage.objects
  for delete using (bucket_id = 'ai-knowledge' and public.is_admin());

-- =============================================================
-- SEED — daftarkan 4 agent bawaan Baboo
-- =============================================================
insert into public.ai_agents (key, name, role, description, status, accent)
values
  ('mandor',    'Baboo Mandor',    'Orchestrator',   'Mengoordinasi seluruh sub-agent dan menerima instruksi proyek.', 'aktif', 'bg-navy text-cream'),
  ('civil',     'Baboo Civil',     'Insinyur Sipil', 'Struktur, pondasi, beban, material, dan analisis teknis konstruksi.', 'aktif', 'bg-sun text-navy-deep'),
  ('cad',       'Baboo CAD',       'Drafter Teknik', 'Gambar kerja, denah, potongan, detail, dan konvensi penggambaran.', 'aktif', 'bg-mint text-navy-deep'),
  ('architect', 'Baboo Architect', 'Arsitek',        'Konsep desain, tata ruang, fasad, sirkulasi, dan regulasi bangunan.', 'aktif', 'bg-coral text-navy-deep')
on conflict (key) do nothing;
