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

alter table public.admin_users enable row level security;
alter table public.model_provider_settings enable row level security;

drop policy if exists "admin_users_admin_read" on public.admin_users;
create policy "admin_users_admin_read" on public.admin_users
  for select using (lower(auth.jwt() ->> 'email') = 'ical.smg@gmail.com');

drop policy if exists "provider_settings_admin_read" on public.model_provider_settings;
create policy "provider_settings_admin_read" on public.model_provider_settings
  for select using (lower(auth.jwt() ->> 'email') = 'ical.smg@gmail.com');

drop policy if exists "provider_settings_admin_insert" on public.model_provider_settings;
create policy "provider_settings_admin_insert" on public.model_provider_settings
  for insert with check (lower(auth.jwt() ->> 'email') = 'ical.smg@gmail.com');

drop policy if exists "provider_settings_admin_update" on public.model_provider_settings;
create policy "provider_settings_admin_update" on public.model_provider_settings
  for update using (lower(auth.jwt() ->> 'email') = 'ical.smg@gmail.com') with check (lower(auth.jwt() ->> 'email') = 'ical.smg@gmail.com');
