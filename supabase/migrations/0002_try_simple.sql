-- Baboo.id backend admin AI settings

create table if not exists public.admin_users (
  email text primary key,
  role text not null default 'administrator',
  created_at timestamptz not null default now()
);

insert into public.admin_users (email, role)
values ('ical.smg@gmail.com', 'administrator')
on conflict (email) do update set role = excluded.role;

create table if not exists public.model_provider_settings (
  provider text primary key,
  display_name text not null,
  model_name text not null default '',
  endpoint_url text not null default '',
  enabled boolean not null default true,
  notes text not null default '',
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.model_provider_settings (provider, display_name, model_name, endpoint_url, enabled)
values
  ('claude', 'Claude', '', '', true),
  ('openai', 'OpenAI / ChatGPT', '', '', true),
  ('gemini', 'Gemini', '', '', true)
on conflict (provider) do nothing;
