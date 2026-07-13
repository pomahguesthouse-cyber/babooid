import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Check, Sparkles, ArrowRight, Workflow } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/page-hero";
import { CartoonLink, SectionHead } from "@/components/cartoon-ui";
import { PROYEK } from "@/lib/agents";

export const Route = createFileRoute("/daftar-baboo")({
  head: () => ({
    meta: [
      { title: "Daftar Baboo — Smart Agent untuk Setiap Profesi | Baboo.id" },
      {
        name: "description",
        content:
          "Jelajahi seluruh Baboo — smart agent siap kerja dari Baboo.id. Mulai dari Baboo Civil yang menghasilkan gambar kerja AutoCAD secara otomatis.",
      },
      { property: "og:title", content: "Daftar Baboo — Smart Agent untuk Setiap Profesi" },
      {
        property: "og:description",
        content:
          "Setiap Baboo adalah smart agent dengan keahlian khusus. Temukan Baboo yang paling cocok untuk pekerjaanmu.",
      },
    ],
  }),
  component: DaftarBabooPage,
});

// Daftar agen Baboo — tambahkan entri baru di sini saat agen baru tersedia
const babooList = [
  {
    slug: "baboo-civil",
    name: "Baboo Civil",
    role: "Asisten Teknik Sipil",
    tagline: "Gambar kerja AutoCAD, selesai dalam hitungan menit.",
    desc: "Baboo Civil membantu insinyur, drafter, dan kontraktor menghasilkan gambar kerja AutoCAD (.dwg) secara otomatis dari sketsa, ukuran, atau deskripsi teks. Cocok untuk denah, potongan, detail struktur, hingga shop drawing.",
    capabilities: [
      "Generate gambar kerja AutoCAD (.dwg / .dxf)",
      "Konversi sketsa tangan menjadi gambar teknik rapi",
      "Otomatis ukuran, notasi, dan kop gambar",
      "Detail denah, tampak, potongan, dan pondasi",
      "Revisi cepat sesuai instruksi teks",
    ],
    forWho: "Konsultan, kontraktor, drafter, dan mahasiswa teknik sipil.",
    accent: "mint",
    iconBg: "#E1F5EE",
    iconStroke: "#0F6E56",
    status: "Tersedia",
    Icon: Building2,
  },
] as const;

const accentMap = {
  mint: { tag: "bg-mint text-navy-deep", eyebrow: "mint" as const },
  sun: { tag: "bg-sun text-navy-deep", eyebrow: "sun" as const },
  coral: { tag: "bg-coral text-navy-deep", eyebrow: "coral" as const },
};

function DaftarBabooPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Daftar Baboo"
        title={
          <>
            Setiap Baboo punya <span className="text-mint-deep">keahliannya sendiri</span>
          </>
        }
        desc="Baboo adalah smart agent — rekan kerja digital yang fokus pada satu bidang. Pilih Baboo sesuai pekerjaanmu, dan biarkan ia mengerjakan bagian yang paling makan waktu."
      />

      {/* Layanan unggulan: Baboo Proyek (satu tim, empat spesialis) */}
      <section className="mx-auto max-w-[1180px] px-7 pt-20">
        <article className="card-pop relative overflow-hidden bg-navy p-8 text-cream md:p-10">
          <div className="absolute -right-16 -top-16 h-[200px] w-[200px] rounded-full bg-mint opacity-20" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-cream/40 px-3 py-1 font-mono text-[11.5px] font-bold text-mint">
                <Sparkles className="h-3.5 w-3.5" />
                Layanan lengkap
              </span>
              <h2 className="mt-4 font-display text-[clamp(26px,3.4vw,38px)] font-extrabold">
                {PROYEK.name}
              </h2>
              <p className="mt-3 max-w-xl text-[16px] opacity-90">{PROYEK.desc}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/baboo-proyek"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-cream bg-sun px-7 py-3.5 font-display text-base font-bold text-navy-deep shadow-[0_8px_0_rgba(251,247,238,0.15)] transition hover:-translate-y-0.5 active:translate-y-0.5"
                >
                  Pelajari Baboo Proyek <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center rounded-full border-[3px] border-cream/40 bg-transparent px-7 py-3.5 font-display text-base font-bold text-cream transition hover:bg-cream hover:text-navy"
                >
                  Mulai proyek
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              {PROYEK.team.map((a) => {
                const Icon = a.icon;
                return (
                  <div
                    key={a.key}
                    className="flex items-center gap-3 rounded-2xl border-2 border-cream/20 bg-cream/5 px-4 py-3"
                  >
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${a.accent}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-cream">{a.name}</p>
                      <p className="truncate text-xs opacity-70">
                        {a.key === "mandor" ? "Koordinator" : a.role}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-[1180px] px-7 py-20">
        <div className="mb-10 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-mint-deep">
          <Workflow className="h-4 w-4" />
          Atau pilih spesialis satuan
        </div>
        <div className="grid gap-7 lg:grid-cols-2">
          {babooList.map((b) => {
            const accent = accentMap[b.accent as keyof typeof accentMap] ?? accentMap.mint;
            return (
              <article key={b.slug} className="card-pop card-pop-hover flex flex-col p-7">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="grid h-14 w-14 place-items-center rounded-2xl"
                    style={{ background: b.iconBg }}
                  >
                    <b.Icon className="h-7 w-7" style={{ color: b.iconStroke }} />
                  </div>
                  <span
                    className={`rounded-full border-2 border-navy px-3 py-1 font-mono text-[11.5px] font-bold ${accent.tag}`}
                  >
                    {b.status}
                  </span>
                </div>

                <h2 className="mt-5 font-display text-2xl font-extrabold text-navy">{b.name}</h2>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-mint-deep">
                  {b.role}
                </p>
                <p className="mt-3 font-display text-lg font-bold text-navy">{b.tagline}</p>
                <p className="mt-3 text-[15px] opacity-85">{b.desc}</p>

                <div className="mt-5">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-navy">
                    <Sparkles className="h-4 w-4 text-mint-deep" />
                    Kemampuan utama
                  </div>
                  <ul className="space-y-2">
                    {b.capabilities.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-[14.5px]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint-deep" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 rounded-2xl border-2 border-dashed border-navy/40 bg-cream-deep px-4 py-3 text-sm">
                  <span className="font-bold text-navy">Cocok untuk: </span>
                  <span className="opacity-85">{b.forWho}</span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <CartoonLink to="/baboo-proyek">
                    Coba Baboo Proyek <ArrowRight className="h-4 w-4" />
                  </CartoonLink>
                  <Link
                    to="/baboo-civil"
                    className="inline-flex items-center justify-center rounded-full border-[3px] border-navy bg-transparent px-6 py-3.5 font-display text-base font-bold text-navy transition hover:bg-navy hover:text-cream"
                  >
                    Pelajari lebih lanjut
                  </Link>
                </div>
              </article>
            );
          })}

          {/* Slot untuk Baboo berikutnya */}
          <article className="flex flex-col items-center justify-center rounded-[24px] border-[2.5px] border-dashed border-navy/50 bg-cream-deep/60 p-10 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white">
              <Sparkles className="h-7 w-7 text-navy/60" />
            </div>
            <h3 className="mt-5 font-display text-xl font-extrabold text-navy">
              Baboo berikutnya sedang dilatih
            </h3>
            <p className="mt-2 max-w-sm text-sm opacity-80">
              Punya ide Baboo untuk bidang pekerjaanmu? Ceritakan ke tim kami — bisa jadi itu Baboo
              berikutnya yang kami luncurkan.
            </p>
            <div className="mt-5">
              <CartoonLink to="/kontak" variant="ghost">
                Usulkan Baboo baru →
              </CartoonLink>
            </div>
          </article>
        </div>
      </section>

      <section className="bg-cream-deep py-20">
        <div className="mx-auto max-w-[1180px] px-7">
          <SectionHead
            eyebrow="Belum yakin?"
            eyebrowTone="sun"
            title="Bingung pilih Baboo yang mana?"
            desc="Konsultasi gratis 30 menit. Cerita soal pekerjaanmu, kami bantu cocokkan Baboo yang paling pas."
          />
          <div className="flex justify-center">
            <CartoonLink to="/kontak">Konsultasi gratis →</CartoonLink>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
