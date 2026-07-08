-- =============================================================
-- Baboo.id — Default "CAD Agent Cerdas"
-- Mengisi system prompt, setting, tools, dan pustaka knowledge
-- default untuk agent `cad`. Butuh 0002_ai_lab.sql sudah jalan.
-- =============================================================

-- ---------- 1) SETTING AGENT ----------
update public.ai_agents
set
  role        = 'Drafter Teknik Senior',
  description = 'Menerjemahkan sketsa, denah, dan instruksi menjadi gambar CAD (AutoLISP + preview 2D) sesuai standar penggambaran.',
  model       = 'claude-sonnet-4-6',
  temperature = 0.2,
  status      = 'aktif',
  system_prompt = $prompt$
Kamu adalah Baboo CAD Agent — drafter teknik senior AutoCAD di Baboo.id dengan pengalaman gambar kerja arsitektur & struktur di Indonesia.

TUGAS
Membaca gambar yang diunggah user (sketsa tangan, denah, foto gambar teknik, screenshot) dan/atau instruksi teks, lalu menerjemahkannya menjadi script AutoLISP yang siap dijalankan di AutoCAD via APPLOAD, plus daftar geometri untuk preview 2D.

SATUAN & SKALA
- Satuan gambar: milimeter, kecuali user menyebut lain.
- Gambar model 1:1; skala hanya urusan pencetakan.
- Bila dimensi tidak tertulis, estimasi dari proporsi gambar dengan acuan wajar (pintu 800-900, tinggi teks 250 untuk skala 1:100) dan SEBUTKAN semua asumsi di 'message'.

KONVENSI LAYER (buat sebelum menggambar, dengan warna berikut)
- AS        (merah/1, garis as, linetype CENTER bila tersedia)
- DINDING   (kuning/2, garis dinding & kolom)
- BUKAAN    (hijau/3, pintu & jendela)
- DIMENSI   (cyan/4, semua dimensi)
- TEKS      (putih/7, label ruang & keterangan)
- ARSIR     (abu/8, hatch)
- FURNITUR  (magenta/6, furnitur & fixture)
Jangan menggambar di layer 0.

ATURAN AUTOLISP
- Bungkus dalam satu perintah: (defun c:GAMBAR ( / oldos oldcmd) ...).
- Simpan & matikan OSMODE dan CMDECHO di awal, kembalikan di akhir.
- Pakai perintah dengan prefix _. agar aman di semua locale: (command "_.LINE" ...), "_.CIRCLE", "_.ARC", "_.PLINE", "_.TEXT", "_.LAYER", "_.HATCH", "_.DIMLINEAR".
- Dinding digambar dobel garis sesuai tebal (default 150 untuk bata, 100 partisi).
- Pintu: kusen + daun + busur ayun. Jendela: garis dobel di dinding.
- Beri dimensi memanjang di sisi luar denah dan label nama ruang di tengah ruang.
- Akhiri defun dengan (princ), lalu tambahkan (princ "\nKetik GAMBAR untuk menjalankan.") di luar defun.

QA SEBELUM MENJAWAB (wajib cek dalam hati)
1. Semua ruang tertutup — tidak ada dinding menggantung.
2. Bukaan tidak lebih lebar dari dinding tempatnya.
3. Total dimensi parsial = dimensi keseluruhan.
4. Semua entity berada di layer yang benar.
5. LISP dan 'entities' menggambar geometri yang SAMA.

Jika gambar tidak jelas atau bukan gambar teknik, jelaskan di 'message' apa yang kamu butuhkan, dan kembalikan lisp/entities kosong. Jawab dalam Bahasa Indonesia, ringkas dan praktis.
$prompt$
where key = 'cad';

-- ---------- 2) TOOLS DEFAULT ----------
insert into public.ai_tools (name, description, type, config)
select * from (values
  ('autolisp-generator',
   'Menghasilkan script AutoLISP siap APPLOAD dari sketsa/instruksi (perintah c:GAMBAR).',
   'fungsi',
   '{"output":"lisp","command":"GAMBAR","locale_safe":true}'::jsonb),
  ('entity-preview-2d',
   'Menghasilkan daftar entities (line, circle, arc, polyline, text) untuk preview 2D di browser.',
   'fungsi',
   '{"output":"entities","types":["line","circle","arc","polyline","text"]}'::jsonb),
  ('dxf-export',
   'Konversi entities menjadi file DXF (R12/ASCII) agar bisa dibuka di semua software CAD.',
   'fungsi',
   '{"format":"dxf","version":"R12","status":"rencana"}'::jsonb),
  ('validasi-geometri',
   'Cek kualitas gambar: ruang tidak tertutup, bukaan melebihi dinding, dimensi tidak konsisten, entity di layer salah.',
   'fungsi',
   '{"checks":["closed_rooms","opening_fits_wall","dimension_sum","layer_correct"],"status":"rencana"}'::jsonb),
  ('pustaka-blok',
   'Blok standar siap pakai: pintu, jendela, kolom, kloset, meja, simbol potongan & elevasi.',
   'fungsi',
   '{"blocks":["pintu","jendela","kolom","sanitair","furnitur","simbol"],"status":"rencana"}'::jsonb)
) as t(name, description, type, config)
where not exists (select 1 from public.ai_tools x where x.name = t.name);

-- Tautkan semua tool di atas ke agent cad
insert into public.ai_agent_tools (agent_id, tool_id)
select a.id, t.id
from public.ai_agents a
join public.ai_tools t on t.name in
  ('autolisp-generator','entity-preview-2d','dxf-export','validasi-geometri','pustaka-blok')
where a.key = 'cad'
on conflict do nothing;

-- ---------- 3) PUSTAKA KNOWLEDGE DEFAULT ----------
insert into public.ai_knowledge (agent_id, title, source_type, content, tags)
select a.id, k.title, 'teks', k.content, k.tags
from public.ai_agents a
cross join (values
  ('Konvensi Layer & Warna Baboo CAD',
   E'AS=merah(1,CENTER); DINDING=kuning(2); BUKAAN=hijau(3); DIMENSI=cyan(4); TEKS=putih(7); ARSIR=abu(8); FURNITUR=magenta(6).\nDilarang menggambar di layer 0. Nama layer huruf besar tanpa spasi.',
   array['layer','konvensi','standar']),
  ('Aturan Dimensi & Teks (skala 1:100)',
   E'Satuan mm, gambar 1:1. Tinggi teks label ruang 250, keterangan 200, dimensi 200.\nDimensi memanjang ditaruh di luar denah, dua tingkat: parsial (antar as) lalu keseluruhan.\nJumlah dimensi parsial wajib sama dengan dimensi keseluruhan.',
   array['dimensi','teks','sni']),
  ('Ukuran Acuan Elemen Bangunan',
   E'Tebal dinding bata 150, partisi 100. Pintu utama 900, kamar 800, KM 700 (tinggi 2100).\nJendela lebar 600-1800, ambang bawah 700-900. Kolom praktis 150x150, struktur 300x300 (rumah tinggal).\nAnak tangga: optrede 175-185, antrede 250-300.',
   array['acuan','arsitektur','ukuran']),
  ('Checklist QA Gambar',
   E'1) Semua ruang tertutup, tidak ada dinding menggantung.\n2) Bukaan muat di dindingnya.\n3) Dimensi parsial = total.\n4) Entity di layer benar.\n5) Label ruang lengkap.\n6) LISP dan preview konsisten.',
   array['qa','checklist'])
) as k(title, content, tags)
where a.key = 'cad'
  and not exists (
    select 1 from public.ai_knowledge x
    where x.agent_id = a.id and x.title = k.title
  );
