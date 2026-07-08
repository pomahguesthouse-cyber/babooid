-- =============================================================
-- Baboo.id — Aktifkan runtime tools CAD Agent
-- Menandai validator entities dan DXF export sebagai fitur aktif.
-- Butuh 0003_cad_agent_cerdas.sql sudah jalan.
-- =============================================================

update public.ai_tools
set
  description = 'Validator runtime untuk membersihkan entities CAD: cek angka valid, layer standar, polyline, radius, teks, dan entity tidak didukung.',
  config = jsonb_set(
    jsonb_set(
      config,
      '{status}',
      '"aktif"'::jsonb,
      true
    ),
    '{runtime}',
    '"edge-function"'::jsonb,
    true
  ),
  updated_at = now()
where name = 'validasi-geometri';

update public.ai_tools
set
  description = 'Konversi entities tervalidasi menjadi file DXF R12/ASCII agar bisa dibuka di AutoCAD dan software CAD lain.',
  config = jsonb_set(
    jsonb_set(
      config,
      '{status}',
      '"aktif"'::jsonb,
      true
    ),
    '{runtime}',
    '"edge-function"'::jsonb,
    true
  ),
  updated_at = now()
where name = 'dxf-export';
