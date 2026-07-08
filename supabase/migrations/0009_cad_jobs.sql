-- =============================================================
-- Baboo.id — CAD Job History
-- Menyimpan riwayat hasil CAD Agent untuk user, audit admin,
-- dataset training, dan pembelajaran dari revisi.
-- Butuh 0002_ai_lab.sql sudah jalan untuk public.is_admin().
-- =============================================================

create table if not exists public.cad_jobs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  prompt     text not null default '',
  image_path text,
  message    text not null default '',
  lisp       text not null default '',
  entities   jsonb not null default '[]'::jsonb,
  warnings   jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists cad_jobs_user_created_idx
  on public.cad_jobs (user_id, created_at desc);

create index if not exists cad_jobs_created_idx
  on public.cad_jobs (created_at desc);

alter table public.cad_jobs enable row level security;

drop policy if exists "cad_jobs_select_own_or_admin" on public.cad_jobs;
create policy "cad_jobs_select_own_or_admin" on public.cad_jobs
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "cad_jobs_insert_own" on public.cad_jobs;
create policy "cad_jobs_insert_own" on public.cad_jobs
  for insert with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "cad_jobs_delete_own_or_admin" on public.cad_jobs;
create policy "cad_jobs_delete_own_or_admin" on public.cad_jobs
  for delete using (auth.uid() = user_id or public.is_admin());

-- Bucket privat untuk gambar input CAD Agent.
insert into storage.buckets (id, name, public)
values ('cad-job-images', 'cad-job-images', false)
on conflict (id) do nothing;

-- User bisa melihat/mengelola file miliknya sendiri berdasarkan folder {user_id}/...
drop policy if exists "cad_job_images_select_own_or_admin" on storage.objects;
create policy "cad_job_images_select_own_or_admin" on storage.objects
  for select using (
    bucket_id = 'cad-job-images'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

drop policy if exists "cad_job_images_insert_own_or_admin" on storage.objects;
create policy "cad_job_images_insert_own_or_admin" on storage.objects
  for insert with check (
    bucket_id = 'cad-job-images'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

drop policy if exists "cad_job_images_delete_own_or_admin" on storage.objects;
create policy "cad_job_images_delete_own_or_admin" on storage.objects
  for delete using (
    bucket_id = 'cad-job-images'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );
