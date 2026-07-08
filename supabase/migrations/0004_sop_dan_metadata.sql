-- =============================================================
-- Baboo.id — SOP per agent + metadata tags
-- Butuh 0002_ai_lab.sql sudah jalan.
-- =============================================================

-- Tags metadata pada agent (mis. DXF, SVG, AutoLISP)
alter table public.ai_agents
  add column if not exists tags text[] not null default '{}';

-- ---------- SOP ----------
create table if not exists public.ai_sops (
  id         uuid primary key default gen_random_uuid(),
  agent_id   uuid not null references public.ai_agents (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 120),
  purpose    text,
  steps      text[] not null default '{}',
  output     text,
  sort       int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_sops_agent_id_idx on public.ai_sops (agent_id, sort);

drop trigger if exists ai_sops_set_updated_at on public.ai_sops;
create trigger ai_sops_set_updated_at
  before update on public.ai_sops
  for each row execute function public.set_updated_at();

alter table public.ai_sops enable row level security;
drop policy if exists "ai_sops_admin_all" on public.ai_sops;
create policy "ai_sops_admin_all" on public.ai_sops
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- SEED untuk agent CAD ----------
update public.ai_agents
set tags = array['DXF','SVG','AutoLISP','Validator']
where key = 'cad' and coalesce(array_length(tags, 1), 0) = 0;

insert into public.ai_sops (agent_id, title, purpose, steps, output, sort)
select a.id, s.title, s.purpose, s.steps, s.output, s.sort
from public.ai_agents a
cross join (values
  ('SOP Analisis Instruksi User',
   'Memahami kebutuhan user secara menyeluruh dari instruksi teks, sketsa, atau referensi agar dapat diterjemahkan menjadi rencana gambar CAD yang akurat.',
   array[
     'Baca instruksi user dengan seksama.',
     'Identifikasi jenis gambar (denah, potongan, detail, layout, dll).',
     'Identifikasi skala, satuan, dan standar yang diminta.',
     'Identifikasi elemen utama: ruang, dinding, bukaan, struktur, simbol, dll.',
     'Catat asumsi jika ada informasi yang belum jelas.',
     'Konfirmasi ringkasan pemahaman kepada user (jika perlu).',
     'Susun rencana drafting berdasarkan kebutuhan yang telah diidentifikasi.'
   ],
   'Ringkasan kebutuhan, asumsi, dan rencana drafting.', 1),
  ('SOP Drafting Plan',
   'Menyusun urutan penggambaran yang efisien sebelum menulis script.',
   array[
     'Tentukan origin (0,0) dan orientasi gambar.',
     'Susun daftar layer yang dibutuhkan beserta warnanya.',
     'Urutkan penggambaran: as -> dinding -> bukaan -> furnitur -> dimensi -> teks.',
     'Hitung koordinat kunci setiap elemen sebelum menggambar.'
   ],
   'Rencana drafting terstruktur dengan koordinat kunci.', 2),
  ('SOP Penempatan Ruang',
   'Menata ruang pada denah sesuai proporsi dan sirkulasi yang wajar.',
   array[
     'Tempatkan ruang utama terlebih dahulu sesuai luas terbesar.',
     'Pastikan sirkulasi antar ruang logis (lebar koridor >= 900 mm).',
     'Posisikan bukaan agar tidak bertabrakan dengan furnitur utama.',
     'Beri label nama ruang di tengah tiap ruang.'
   ],
   'Denah dengan tata ruang proporsional dan berlabel.', 3),
  ('SOP Validasi Gambar',
   'Memastikan gambar bebas kesalahan sebelum diserahkan ke user.',
   array[
     'Cek semua ruang tertutup, tidak ada dinding menggantung.',
     'Cek bukaan muat pada dindingnya.',
     'Cek jumlah dimensi parsial sama dengan dimensi total.',
     'Cek semua entity berada di layer yang benar.',
     'Cek konsistensi antara script LISP dan entities preview.'
   ],
   'Checklist QA terpenuhi; daftar perbaikan bila ada.', 4),
  ('SOP Revisi Layout',
   'Menangani permintaan revisi tanpa merusak bagian yang sudah benar.',
   array[
     'Identifikasi elemen yang diminta berubah dan dampaknya.',
     'Pertahankan elemen lain yang tidak terdampak.',
     'Perbarui dimensi dan label yang terpengaruh.',
     'Jalankan ulang SOP Validasi Gambar sebelum menyerahkan hasil.'
   ],
   'Gambar revisi yang konsisten dengan versi sebelumnya.', 5),
  ('SOP Export DXF/SVG',
   'Menghasilkan file keluaran yang kompatibel lintas software CAD.',
   array[
     'Pastikan seluruh entities valid dan berada di layer benar.',
     'Gunakan format DXF R12/ASCII untuk kompatibilitas maksimum.',
     'Sertakan preview SVG dengan skala dan viewBox yang sesuai.',
     'Verifikasi file hasil ekspor bisa dibuka tanpa error.'
   ],
   'File DXF/SVG siap unduh.', 6)
) as s(title, purpose, steps, output, sort)
where a.key = 'cad'
  and not exists (
    select 1 from public.ai_sops x where x.agent_id = a.id and x.title = s.title
  );
