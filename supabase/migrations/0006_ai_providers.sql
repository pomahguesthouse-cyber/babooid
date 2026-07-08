-- =============================================================
-- Baboo.id — Multi-provider AI (Anthropic, Google, OpenRouter, OpenAI, Custom)
-- Butuh 0002_ai_lab.sql (is_admin, set_updated_at) sudah jalan.
-- =============================================================

create table if not exists public.ai_providers (
  key        text primary key,                 -- anthropic | google | openrouter | openai | custom
  name       text not null,
  base_url   text not null default '',
  api_key    text not null default '',
  models     text not null default '',         -- dipisah koma
  enabled    boolean not null default false,
  updated_at timestamptz not null default now()
);

drop trigger if exists ai_providers_set_updated_at on public.ai_providers;
create trigger ai_providers_set_updated_at
  before update on public.ai_providers
  for each row execute function public.set_updated_at();

alter table public.ai_providers enable row level security;
drop policy if exists "ai_providers_admin_all" on public.ai_providers;
create policy "ai_providers_admin_all" on public.ai_providers
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.ai_providers (key, name, base_url, models, enabled) values
  ('anthropic',  'Anthropic',        'https://api.anthropic.com',
   'claude-sonnet-4-6,claude-opus-4-8,claude-haiku-4-5', true),
  ('google',     'Google AI Studio', 'https://generativelanguage.googleapis.com/v1beta/openai',
   'gemini-2.5-pro,gemini-2.5-flash,gemini-2.5-flash-lite', false),
  ('openrouter', 'OpenRouter',       'https://openrouter.ai/api/v1',
   'anthropic/claude-sonnet-4.5,openai/gpt-4o,google/gemini-2.5-flash,deepseek/deepseek-chat', false),
  ('openai',     'OpenAI',           'https://api.openai.com/v1',
   'gpt-4o,gpt-4o-mini,gpt-4.1', false),
  ('custom',     'Custom Endpoint',  '',
   '', false)
on conflict (key) do nothing;

-- Pindahkan API key Anthropic lama dari ai_settings (bila ada)
update public.ai_providers p
set api_key = s.value
from public.ai_settings s
where p.key = 'anthropic'
  and s.key = 'anthropic_api_key'
  and coalesce(p.api_key, '') = ''
  and coalesce(s.value, '') <> '';

-- Tiap agent menunjuk provider
alter table public.ai_agents
  add column if not exists provider text not null default 'anthropic'
  references public.ai_providers (key);
