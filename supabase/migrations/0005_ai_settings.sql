-- =============================================================
-- Baboo.id — Pengaturan global AI (API key, model default)
-- Butuh 0002_ai_lab.sql sudah jalan (fungsi is_admin & set_updated_at).
-- =============================================================

create table if not exists public.ai_settings (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

drop trigger if exists ai_settings_set_updated_at on public.ai_settings;
create trigger ai_settings_set_updated_at
  before update on public.ai_settings
  for each row execute function public.set_updated_at();

alter table public.ai_settings enable row level security;
drop policy if exists "ai_settings_admin_all" on public.ai_settings;
create policy "ai_settings_admin_all" on public.ai_settings
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.ai_settings (key, value) values
  ('anthropic_api_key', ''),
  ('default_model', 'claude-sonnet-4-6'),
  ('models', 'claude-sonnet-4-6,claude-opus-4-8,claude-haiku-4-5')
on conflict (key) do nothing;
