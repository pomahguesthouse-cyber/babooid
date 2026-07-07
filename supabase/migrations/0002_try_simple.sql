create table if not exists public.backend_test_settings (
  name text primary key,
  value text not null default ''
);
