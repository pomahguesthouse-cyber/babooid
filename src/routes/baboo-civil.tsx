import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  Check,
  ArrowRight,
  FileDigit,
  Layers,
  Ruler,
  PenTool,
  RefreshCw,
  FileCheck,
  Zap,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/page-hero";
import { CartoonLink, SectionHead, Eyebrow } from "@/components/cartoon-ui";

export const Route = createFileRoute("/baboo-civil")({
  head: () => ({
    meta: [
      { title: "Baboo Civil — Smart Agent Teknik Sipil & AutoCAD | Baboo.id" },
      {
        name: "description",
        content:
          "Baboo Civil menghasilkan gambar kerja AutoCAD (.dwg / .dxf) secara otomatis dari sketsa, ukuran, atau deskripsi teks. Denah, potongan, detail struktur, dan shop drawing selesai dalam hitungan menit.",
      },
      { property: "og:title", content: "Baboo Civil — Smart Agent Teknik Sipil & AutoCAD" },
      {
        property: "og:description",
        content:
          "Gambar kerja AutoCAD, selesai dalam hitungan menit. Konversi sketsa tangan ke gambar teknik rapi, otomatis dimensi dan notasi.",
      },
    ],
  }),
  component: BabooCivilPage,
});

const features = [
  {
    icon: FileDigit,
    title: "Generate DWG / DXF",
    desc: "Hasilkan file gambar kerja AutoCAD native (.dwg dan .dxf) yang siap dibuka langsung di AutoCAD, ZWCAD, atau BricsCAD.",
    color: "#0F6E56",
    bg: "#E1F5EE",
  },
  {
    icon: PenTool,
    title: "Sketsa ke Gambar Teknik",
    desc: "Unggah foto sketsa tangan di kertas atau whiteboard, Baboo Civil akan mengubahnya menjadi gambar teknik bersih dengan garis dan simbol standar.",
    color: "#8a5a00",
    bg: "#FFF3D6",
  },
  {
    icon: Ruler,
    title: "Auto Dimensi & Notasi",
    desc: "Dimensi, jarak, level, dan simbol arsitektur/sipil ditempatkan otomatis sesuai standar gambar Indonesia (SNI) maupun internasional.",
    color: "#a63d14",
    bg: "#FFEBE3",
  },
  {
    icon: Layers,
    title: "Detail Denah & Potongan",
    desc: "Buat denah lantai, tampak depan/samping, potongan melintang/memanjang, detail pondasi, sloof, kolom, balok, dan plat lantai.",
    color: "#0F6E56",
    bg: "#E1F5EE",
  },
  {
    icon: RefreshCw,
    title: "Revisi Cepat via Teks",
    desc: "Perlu ubah ukuran ruangan, tambah jendela, atau geser dinding? Cukup kirim instruksi teks, Baboo Civil update gambarnya dalam menit.",
    color: "#8a5a00",
    bg: "#FFF3D6",
  },
  {
    icon: FileCheck,
    title: "Kop Gambar & Layer Standar",
    desc: "Setiap file dilengkapi kop gambar (title block) dengan nama proyek, skala, dan tanggal. Layer diatur rapi sesuai konvensi AIA atau custom.",
    color: "#a63d14",
    bg: "#FFEBE3",
  },
];

const outputSpecs = [
  { label: "Format file", value: ".dwg (AutoCAD 2013–2024), .dxf (R12–2024)" },
  { label: "Unit default", value: "Meter / Millimeter (bisa disesuaikan)" },
  { label: "Sistem koordinat", value: "Cartesian 2D / 3D (opsional)" },
  { label: "Layer", value: "A-WALL, A-DOOR, A-WIND, S-FOUND, S-COLS, dll." },
  { label: "Font teks", value: "romans.shx, isocp.shx, atau TrueType Arial" },
  { label: "Skala output", value: "1:50, 1:100, 1:200 (customizable)" },
];

const steps = [
  {
    num: "01",
    title: "Kirim Brief",
    desc: "Unggah sketsa, foto lokasi, atau deskripsikan kebutuhan gambar kerja dalam chat.",
  },
  {
    num: "02",
    title: "Baboo Proses",
    desc: "AI agent menganalisis kebutuhan, memilih template, dan menghasilkan gambar sesuai standar.",
  },
  {
    num: "03",
    title: "Review & Revisi",
    desc: "Lihat preview gambar kerja. Minta perubahan langsung via teks — tanpa biaya revisi tambahan.",
  },
  {
    num: "04",
    title: "Download File",
    desc: "File .dwg / .dxf siap pakai. Buka di CAD favoritmu dan lanjutkan ke tahap RAB atau approval.",
  },
];

function BabooCivilPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <PageHero
        eyebrow="Baboo Civil"
        eyebrowTone="mint"
        title={
          <>
            Gambar kerja AutoCAD,{" "}
            <span className="text-mint-deep">selesai dalam hitungan menit</span>
          </>
        }
        desc="Baboo Civil adalah smart agent teknik sipil yang menghasilkan gambar kerja .dwg / .dxf secara otomatis dari sketsa, foto, atau deskripsi teks. Dari denah rumah hingga detail struktur gedung."
      >
        <CartoonLink to="/baboo-proyek">
          Coba Baboo Proyek <ArrowRight className="h-4 w-4" />
        </CartoonLink>
        <Link
          to="/daftar-baboo"
          className="inline-flex items-center justify-center rounded-full border-[3px] border-navy bg-transparent px-7 py-3.5 font-display text-base font-bold text-navy transition hover:bg-navy hover:text-cream"
        >
          Lihat daftar Baboo
        </Link>
      </PageHero>

      {/* Fitur */}
      <section className="mx-auto max-w-[1180px] px-7 py-20">
        <SectionHead
          eyebrow="Fitur Lengkap"
          eyebrowTone="mint"
          title={
            <>
              Semua yang dibutuhkan untuk{" "}
              <span className="text-mint-deep">gambar kerja sipil</span>
            </>
          }
          desc="Baboo Civil bukan sekadar drafter otomatis — ia memahami konteks konstruksi dan menghasilkan gambar yang sesuai standar."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="card-pop card-pop-hover flex flex-col p-6">
              <div
                className="grid h-12 w-12 place-items-center rounded-xl"
                style={{ background: f.bg }}
              >
                <f.icon className="h-6 w-6" style={{ color: f.color }} />
              </div>
              <h3 className="mt-4 font-display text-lg font-extrabold text-navy">{f.title}</h3>
              <p className="mt-2 text-[15px] opacity-85">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Output Format */}
      <section className="bg-cream-deep py-20">
        <div className="mx-auto max-w-[1180px] px-7">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Eyebrow tone="sun">Output Format</Eyebrow>
              <h2 className="mt-3 font-display text-[clamp(28px,3.6vw,40px)] font-extrabold text-navy">
                File siap pakai di <span className="text-mint-deep">AutoCAD</span>
              </h2>
              <p className="mt-4 text-[16.5px] opacity-85">
                Hasil Baboo Civil adalah file CAD native, bukan gambar raster atau PDF. Bisa diedit
                langsung, di-layer dengan rapi, dan cocok untuk tender maupun konsultasi.
              </p>

              <div className="mt-8 space-y-3">
                {outputSpecs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-center justify-between rounded-2xl border-2 border-navy/30 bg-white px-5 py-3"
                  >
                    <span className="font-display text-sm font-bold text-navy">{spec.label}</span>
                    <span className="text-right text-sm opacity-85">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual mockup DWG file */}
            <div className="card-pop relative overflow-hidden p-0">
              <div className="flex items-center gap-2 border-b-2 border-navy/20 bg-cream-deep/60 px-5 py-3">
                <div className="h-3 w-3 rounded-full bg-coral" />
                <div className="h-3 w-3 rounded-full bg-sun" />
                <div className="h-3 w-3 rounded-full bg-mint" />
                <span className="ml-2 font-mono text-xs opacity-70">Denah_Rumah_Tipe_72.dwg</span>
              </div>
              <div className="relative bg-white p-6">
                {/* Simple SVG floor plan mockup */}
                <svg viewBox="0 0 400 300" className="w-full" aria-label="Preview gambar kerja AutoCAD denah rumah">
                  <rect x="20" y="20" width="360" height="260" fill="none" stroke="#13294b" strokeWidth="2" />
                  {/* Rooms */}
                  <rect x="20" y="20" width="120" height="130" fill="none" stroke="#13294b" strokeWidth="1.5" />
                  <rect x="140" y="20" width="120" height="130" fill="none" stroke="#13294b" strokeWidth="1.5" />
                  <rect x="260" y="20" width="120" height="130" fill="none" stroke="#13294b" strokeWidth="1.5" />
                  <rect x="20" y="150" width="180" height="130" fill="none" stroke="#13294b" strokeWidth="1.5" />
                  <rect x="200" y="150" width="180" height="130" fill="none" stroke="#13294b" strokeWidth="1.5" />
                  {/* Door arcs */}
                  <path d="M 80 150 A 20 20 0 0 1 100 170" fill="none" stroke="#0f6e56" strokeWidth="1.5" />
                  <path d="M 200 80 A 20 20 0 0 1 220 100" fill="none" stroke="#0f6e56" strokeWidth="1.5" />
                  <path d="M 320 150 A 20 20 0 0 1 300 170" fill="none" stroke="#0f6e56" strokeWidth="1.5" />
                  {/* Windows */}
                  <line x1="60" y1="20" x2="100" y2="20" stroke="#ff8c69" strokeWidth="3" />
                  <line x1="180" y1="20" x2="220" y2="20" stroke="#ff8c69" strokeWidth="3" />
                  <line x1="300" y1="20" x2="340" y2="20" stroke="#ff8c69" strokeWidth="3" />
                  {/* Dimensions */}
                  <line x1="20" y1="295" x2="200" y2="295" stroke="#a63d14" strokeWidth="1" strokeDasharray="4 2" />
                  <text x="110" y="290" textAnchor="middle" fontSize="10" fill="#a63d14" fontFamily="monospace">4000</text>
                  <line x1="200" y1="295" x2="380" y2="295" stroke="#a63d14" strokeWidth="1" strokeDasharray="4 2" />
                  <text x="290" y="290" textAnchor="middle" fontSize="10" fill="#a63d14" fontFamily="monospace">3500</text>
                  {/* Labels */}
                  <text x="80" y="90" textAnchor="middle" fontSize="11" fill="#13294b" fontFamily="var(--font-display), sans-serif" fontWeight="bold">Kamar Tidur</text>
                  <text x="200" y="90" textAnchor="middle" fontSize="11" fill="#13294b" fontFamily="var(--font-display), sans-serif" fontWeight="bold">Ruang Tamu</text>
                  <text x="320" y="90" textAnchor="middle" fontSize="11" fill="#13294b" fontFamily="var(--font-display), sans-serif" fontWeight="bold">Kamar Tidur</text>
                  <text x="110" y="220" textAnchor="middle" fontSize="11" fill="#13294b" fontFamily="var(--font-display), sans-serif" fontWeight="bold">Dapur & Ruang Makan</text>
                  <text x="290" y="220" textAnchor="middle" fontSize="11" fill="#13294b" fontFamily="var(--font-display), sans-serif" fontWeight="bold">Kamar Mandi & Laundry</text>
                  {/* Title block */}
                  <rect x="220" y="255" width="160" height="35" fill="#f3ecdb" stroke="#13294b" strokeWidth="1" />
                  <text x="230" y="268" fontSize="8" fill="#13294b" fontFamily="monospace">PROYEK: RUMAH TIPE 72</text>
                  <text x="230" y="280" fontSize="8" fill="#13294b" fontFamily="monospace">SKALA: 1:100</text>
                  <text x="330" y="280" fontSize="8" fill="#13294b" fontFamily="monospace">DENAH</text>
                </svg>
                <div className="mt-4 flex items-center gap-2 rounded-full bg-mint/15 px-4 py-2 text-sm font-bold text-mint-deep">
                  <Zap className="h-4 w-4" />
                  Dihasilkan oleh Baboo Civil dalam 4 menit
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contoh Hasil */}
      <section className="mx-auto max-w-[1180px] px-7 py-20">
        <SectionHead
          eyebrow="Contoh Hasil"
          eyebrowTone="coral"
          title={
            <>
              Lihat hasil nyata{" "}
              <span className="text-mint-deep">Baboo Civil</span>
            </>
          }
          desc="Berikut beberapa contoh output gambar kerja yang dihasilkan Baboo Civil dari brief sederhana."
        />

        <div className="grid gap-7 md:grid-cols-3">
          {/* Contoh 1: Denah */}
          <article className="card-pop card-pop-hover overflow-hidden">
            <div className="bg-white p-4">
              <svg viewBox="0 0 320 240" className="w-full" aria-label="Contoh denah rumah tipe 60">
                <rect x="15" y="15" width="290" height="210" fill="none" stroke="#13294b" strokeWidth="2" />
                <rect x="15" y="15" width="140" height="105" fill="none" stroke="#13294b" strokeWidth="1.5" />
                <rect x="155" y="15" width="150" height="105" fill="none" stroke="#13294b" strokeWidth="1.5" />
                <rect x="15" y="120" width="180" height="105" fill="none" stroke="#13294b" strokeWidth="1.5" />
                <rect x="195" y="120" width="110" height="105" fill="none" stroke="#13294b" strokeWidth="1.5" />
                <path d="M 85 120 A 15 15 0 0 1 100 135" fill="none" stroke="#0f6e56" strokeWidth="1.5" />
                <path d="M 155 60 A 15 15 0 0 1 170 75" fill="none" stroke="#0f6e56" strokeWidth="1.5" />
                <line x1="50" y1="15" x2="100" y2="15" stroke="#ff8c69" strokeWidth="3" />
                <line x1="195" y1="15" x2="240" y2="15" stroke="#ff8c69" strokeWidth="3" />
                <text x="85" y="75" textAnchor="middle" fontSize="10" fill="#13294b" fontWeight="bold">Kamar Utama</text>
                <text x="230" y="75" textAnchor="middle" fontSize="10" fill="#13294b" fontWeight="bold">Ruang Keluarga</text>
                <text x="105" y="175" textAnchor="middle" fontSize="10" fill="#13294b" fontWeight="bold">Dapur & Makan</text>
                <text x="250" y="175" textAnchor="middle" fontSize="10" fill="#13294b" fontWeight="bold">KM & Teras</text>
                <rect x="200" y="210" width="105" height="28" fill="#f3ecdb" stroke="#13294b" strokeWidth="1" />
                <text x="208" y="226" fontSize="8" fill="#13294b" fontFamily="monospace">DENAH RUMAH T60</text>
                <text x="280" y="226" fontSize="8" fill="#13294b" fontFamily="monospace">1:100</text>
              </svg>
            </div>
            <div className="border-t-2 border-navy/20 p-5">
              <h3 className="font-display text-lg font-extrabold text-navy">Denah Rumah Tipe 60</h3>
              <p className="mt-1 text-sm opacity-80">
                Dari brief: "Rumah 2 kamar, ruang keluarga luas, dapur terbuka". Output: denah
                lengkap dengan dimensi dan notasi pintu/jendela.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-navy/30 bg-cream-deep px-3 py-1 text-xs font-bold text-navy">
                  .dwg
                </span>
                <span className="rounded-full border border-navy/30 bg-cream-deep px-3 py-1 text-xs font-bold text-navy">
                  .dxf
                </span>
                <span className="rounded-full border border-navy/30 bg-cream-deep px-3 py-1 text-xs font-bold text-navy">
                  Denah
                </span>
              </div>
            </div>
          </article>

          {/* Contoh 2: Potongan */}
          <article className="card-pop card-pop-hover overflow-hidden">
            <div className="bg-white p-4">
              <svg viewBox="0 0 320 240" className="w-full" aria-label="Contoh potongan melintang rumah">
                <rect x="15" y="15" width="290" height="210" fill="none" stroke="#13294b" strokeWidth="2" />
                {/* Ground */}
                <line x1="15" y1="200" x2="305" y2="200" stroke="#13294b" strokeWidth="2" />
                <line x1="15" y1="205" x2="305" y2="205" stroke="#13294b" strokeWidth="1" strokeDasharray="6 4" />
                {/* Walls */}
                <rect x="40" y="80" width="12" height="120" fill="none" stroke="#13294b" strokeWidth="2" />
                <rect x="268" y="80" width="12" height="120" fill="none" stroke="#13294b" strokeWidth="2" />
                <rect x="40" y="80" width="240" height="8" fill="none" stroke="#13294b" strokeWidth="2" />
                {/* Roof */}
                <line x1="30" y1="80" x2="160" y2="25" stroke="#13294b" strokeWidth="2" />
                <line x1="160" y1="25" x2="290" y2="80" stroke="#13294b" strokeWidth="2" />
                <line x1="40" y1="80" x2="160" y2="32" stroke="#13294b" strokeWidth="1" strokeDasharray="4 3" />
                <line x1="160" y1="32" x2="280" y2="80" stroke="#13294b" strokeWidth="1" strokeDasharray="4 3" />
                {/* Foundation */}
                <rect x="30" y="200" width="22" height="20" fill="#e1f5ee" stroke="#0f6e56" strokeWidth="1.5" />
                <rect x="268" y="200" width="22" height="20" fill="#e1f5ee" stroke="#0f6e56" strokeWidth="1.5" />
                <rect x="52" y="205" width="216" height="15" fill="#f3ecdb" stroke="#13294b" strokeWidth="1.5" />
                {/* Dimension lines */}
                <line x1="15" y1="60" x2="305" y2="60" stroke="#a63d14" strokeWidth="1" />
                <line x1="40" y1="58" x2="40" y2="62" stroke="#a63d14" strokeWidth="1" />
                <line x1="280" y1="58" x2="280" y2="62" stroke="#a63d14" strokeWidth="1" />
                <text x="160" y="55" textAnchor="middle" fontSize="9" fill="#a63d14" fontFamily="monospace">8000</text>
                <line x1="15" y1="170" x2="305" y2="170" stroke="#a63d14" strokeWidth="1" />
                <line x1="40" y1="168" x2="40" y2="172" stroke="#a63d14" strokeWidth="1" />
                <line x1="40" y1="168" x2="40" y2="172" stroke="#a63d14" strokeWidth="1" />
                <text x="28" y="165" textAnchor="middle" fontSize="8" fill="#a63d14" fontFamily="monospace">+0.00</text>
                <text x="28" y="228" textAnchor="middle" fontSize="8" fill="#a63d14" fontFamily="monospace">-0.80</text>
                {/* Labels */}
                <text x="160" y="115" textAnchor="middle" fontSize="10" fill="#13294b" fontWeight="bold">TINGGI RUANG 3200</text>
                <text x="160" y="130" textAnchor="middle" fontSize="9" fill="#13294b">Atap Pelana + Plafon</text>
                <rect x="200" y="210" width="105" height="28" fill="#f3ecdb" stroke="#13294b" strokeWidth="1" />
                <text x="208" y="226" fontSize="8" fill="#13294b" fontFamily="monospace">POTONGAN A-A</text>
                <text x="280" y="226" fontSize="8" fill="#13294b" fontFamily="monospace">1:100</text>
              </svg>
            </div>
            <div className="border-t-2 border-navy/20 p-5">
              <h3 className="font-display text-lg font-extrabold text-navy">Potongan Melintang A-A</h3>
              <p className="mt-1 text-sm opacity-80">
                Dari brief: "Potongan rumah sederhana, fondasi tapak, atap pelana". Output:
                potongan dengan ketinggian ruang, detail fondasi, dan notasi level.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-navy/30 bg-cream-deep px-3 py-1 text-xs font-bold text-navy">
                  .dwg
                </span>
                <span className="rounded-full border border-navy/30 bg-cream-deep px-3 py-1 text-xs font-bold text-navy">
                  Potongan
                </span>
                <span className="rounded-full border border-navy/30 bg-cream-deep px-3 py-1 text-xs font-bold text-navy">
                  Detail
                </span>
              </div>
            </div>
          </article>

          {/* Contoh 3: Detail Struktur */}
          <article className="card-pop card-pop-hover overflow-hidden">
            <div className="bg-white p-4">
              <svg viewBox="0 0 320 240" className="w-full" aria-label="Contoh detail penulangan kolom dan balok">
                <rect x="15" y="15" width="290" height="210" fill="none" stroke="#13294b" strokeWidth="2" />
                {/* Column */}
                <rect x="60" y="40" width="80" height="80" fill="none" stroke="#13294b" strokeWidth="2" />
                <line x1="60" y1="40" x2="140" y2="120" stroke="#13294b" strokeWidth="0.5" strokeDasharray="3 2" />
                <line x1="140" y1="40" x2="60" y2="120" stroke="#13294b" strokeWidth="0.5" strokeDasharray="3 2" />
                <circle cx="85" cy="65" r="6" fill="none" stroke="#0f6e56" strokeWidth="2" />
                <circle cx="115" cy="65" r="6" fill="none" stroke="#0f6e56" strokeWidth="2" />
                <circle cx="85" cy="95" r="6" fill="none" stroke="#0f6e56" strokeWidth="2" />
                <circle cx="115" cy="95" r="6" fill="none" stroke="#0f6e56" strokeWidth="2" />
                {/* Stirrups */}
                <rect x="72" y="52" width="36" height="36" fill="none" stroke="#ff8c69" strokeWidth="1.5" />
                {/* Beam */}
                <rect x="40" y="160" width="240" height="50" fill="none" stroke="#13294b" strokeWidth="2" />
                <line x1="60" y1="160" x2="60" y2="210" stroke="#13294b" strokeWidth="1" strokeDasharray="3 2" />
                <line x1="100" y1="160" x2="100" y2="210" stroke="#13294b" strokeWidth="1" strokeDasharray="3 2" />
                <line x1="220" y1="160" x2="220" y2="210" stroke="#13294b" strokeWidth="1" strokeDasharray="3 2" />
                <line x1="260" y1="160" x2="260" y2="210" stroke="#13294b" strokeWidth="1" strokeDasharray="3 2" />
                <circle cx="80" cy="175" r="4" fill="none" stroke="#0f6e56" strokeWidth="1.5" />
                <circle cx="120" cy="175" r="4" fill="none" stroke="#0f6e56" strokeWidth="1.5" />
                <circle cx="200" cy="175" r="4" fill="none" stroke="#0f6e56" strokeWidth="1.5" />
                <circle cx="240" cy="175" r="4" fill="none" stroke="#0f6e56" strokeWidth="1.5" />
                <rect x="70" y="165" width="40" height="20" fill="none" stroke="#ff8c69" strokeWidth="1" />
                {/* Labels */}
                <text x="100" y="140" textAnchor="middle" fontSize="9" fill="#13294b" fontWeight="bold">Kolom 300x300</text>
                <text x="160" y="155" textAnchor="middle" fontSize="9" fill="#13294b" fontWeight="bold">Balok 200x350</text>
                <text x="80" y="195" fontSize="8" fill="#0f6e56" fontFamily="monospace">4D16</text>
                <text x="210" y="195" fontSize="8" fill="#0f6e56" fontFamily="monospace">3D13</text>
                <rect x="200" y="210" width="105" height="28" fill="#f3ecdb" stroke="#13294b" strokeWidth="1" />
                <text x="208" y="226" fontSize="8" fill="#13294b" fontFamily="monospace">DETAIL STRUKTUR</text>
                <text x="280" y="226" fontSize="8" fill="#13294b" fontFamily="monospace">1:20</text>
              </svg>
            </div>
            <div className="border-t-2 border-navy/20 p-5">
              <h3 className="font-display text-lg font-extrabold text-navy">Detail Penulangan Kolom & Balok</h3>
              <p className="mt-1 text-sm opacity-80">
                Dari brief: "Detail kolom 30x30 cm dan balok 20x35 cm dengan tulangan D16". Output:
                detail penulangan lengkap dengan begel dan notasi besi.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-navy/30 bg-cream-deep px-3 py-1 text-xs font-bold text-navy">
                  .dwg
                </span>
                <span className="rounded-full border border-navy/30 bg-cream-deep px-3 py-1 text-xs font-bold text-navy">
                  Struktur
                </span>
                <span className="rounded-full border border-navy/30 bg-cream-deep px-3 py-1 text-xs font-bold text-navy">
                  Detail
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Cara Kerja */}
      <section className="bg-cream-deep py-20">
        <div className="mx-auto max-w-[1180px] px-7">
          <SectionHead
            eyebrow="Proses Kerja"
            eyebrowTone="sun"
            title={
              <>
                Dari brief ke gambar kerja{" "}
                <span className="text-mint-deep">hanya 4 langkah</span>
              </>
            }
            desc="Tidak perlu menggambar manual atau mempelajari software CAD. Baboo Civil mengerjakan semuanya."
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <article key={s.num} className="card-pop flex flex-col p-6 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mint font-display text-lg font-extrabold text-navy-deep">
                  {s.num}
                </span>
                <h3 className="mt-4 font-display text-lg font-extrabold text-navy">{s.title}</h3>
                <p className="mt-2 text-[15px] opacity-85">{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Siapa yang cocok */}
      <section className="mx-auto max-w-[1180px] px-7 py-20">
        <div className="card-pop flex flex-col items-center gap-8 p-8 md:flex-row md:p-10">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-mint/20">
            <Building2 className="h-10 w-10 text-mint-deep" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="font-display text-2xl font-extrabold text-navy">Cocok untuk siapa?</h2>
            <p className="mt-2 text-[16px] opacity-85">
              Kontraktor kecil & menengah yang ingin cepat mengeluarkan gambar kerja tanpa perlu
              hire drafter full-time. Mahasiswa teknik sipil yang butuh referensi gambar rapi untuk
              tugas akhir. Konsultan perencana yang ingin mempercepat produksi drawing. Bahkan
              arsitek yang butuh gambar detail struktur untuk tender.
            </p>
          </div>
          <div className="shrink-0">
            <CartoonLink to="/kontak">
              Mulai sekarang <ArrowRight className="h-4 w-4" />
            </CartoonLink>
          </div>
        </div>
      </section>

      {/* FAQ mini / trust */}
      <section className="bg-cream-deep py-20">
        <div className="mx-auto max-w-[780px] px-7">
          <SectionHead
            eyebrow="Pertanyaan Umum"
            eyebrowTone="mint"
            title="Hal yang sering ditanyakan soal Baboo Civil"
          />
          <div className="space-y-4">
            {[
              {
                q: "Apakah file hasil bisa diedit di AutoCAD?",
                a: "Ya. Output Baboo Civil adalah file .dwg native AutoCAD dengan layer, dimensi, dan block yang terpisah. Bisa diedit, di-scale, atau di-export ke format lain seperti PDF atau IFC.",
              },
              {
                q: "Berapa lama gambar kerja selesai?",
                a: "Denah sederhana biasanya selesai dalam 3–7 menit. Potongan dan detail struktur membutuhkan waktu 5–15 menit tergantung kompleksitas. Revisi teks biasanya selesai dalam 1–3 menit.",
              },
              {
                q: "Apakah gambarnya sudah sesuai standar SNI?",
                a: "Baboo Civil menggunakan konvensi gambar teknik yang umum di Indonesia (simbol pintu, jendela, sanitaire, dan notasi besi sesuai SNI). Kamu juga bisa minta custom standard sesuai kebutuhan kantormu.",
              },
              {
                q: "Bisakah saya request gambar 3D atau model BIM?",
                a: "Saat ini Baboo Civil fokus pada gambar kerja 2D (.dwg / .dxf). Dukungan 3D dan BIM sedang dalam pengembangan dan akan dirilis untuk pengguna Business & Enterprise.",
              },
            ].map((item) => (
              <div key={item.q} className="card-pop p-5">
                <h4 className="font-display text-base font-extrabold text-navy">{item.q}</h4>
                <p className="mt-2 text-[15px] opacity-85">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1180px] px-7 py-20">
        <div className="card-pop relative overflow-hidden bg-navy p-10 text-center text-cream md:p-14">
          <div className="absolute -left-16 -top-16 h-[180px] w-[180px] rounded-full bg-mint opacity-20" />
          <div className="absolute -bottom-20 -right-20 h-[200px] w-[200px] rounded-full bg-sun opacity-20" />
          <div className="relative">
            <h2 className="font-display text-[clamp(26px,4vw,40px)] font-extrabold">
              Siap percepat produksi gambar kerjamu?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[17px] opacity-90">
              Coba Baboo Proyek gratis untuk proyek pertamamu. Tanpa kartu kredit, tanpa
              komitmen.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/baboo-proyek"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-cream bg-sun px-8 py-3.5 font-display text-base font-bold text-navy-deep shadow-[0_8px_0_rgba(251,247,238,0.15)] transition hover:-translate-y-0.5 active:translate-y-0.5"
              >
                Coba Baboo Proyek gratis <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/harga"
                className="inline-flex items-center justify-center rounded-full border-[3px] border-cream/40 bg-transparent px-8 py-3.5 font-display text-base font-bold text-cream transition hover:bg-cream hover:text-navy"
              >
                Lihat harga
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
