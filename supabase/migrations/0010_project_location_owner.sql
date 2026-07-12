-- =============================================================
-- Baboo.id — Tambah kolom lokasi & owner pada proyek
-- Dipakai oleh sidebar detail proyek di halaman demo & dashboard.
-- =============================================================

alter table public.projects
  add column if not exists location   text,
  add column if not exists owner_name text;
