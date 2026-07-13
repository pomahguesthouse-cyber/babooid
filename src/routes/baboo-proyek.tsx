import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Sparkles, Workflow } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/page-hero";
import { CartoonLink, SectionHead, Eyebrow } from "@/components/cartoon-ui";
import { AGENTS, PROYEK } from "@/lib/agents";

export const Route = createFileRoute("/baboo-proyek")({
  head: () => ({
    meta: [
      { title: "Baboo Proyek — Satu Tim Konstruksi dalam Satu Layanan | Baboo.id" },
      {
        name: "description",
        content:
          "Baboo Proyek menyatukan Baboo Mandor, Civil, CAD, dan Architect dalam satu ruang kerja. Mandor mengoordinasi, spesialis mengerjakan — dari analisis sipil, gambar kerja, sampai desain arsitektur.",
      },
      {
        property: "og:title",
        content: "Baboo Proyek — Satu Tim Konstruksi dalam Satu Layanan",
      },
      {
        property: "og:description",
        content:
          "Satu layanan, empat spesialis. Mandor mengoordinasi Civil, CAD, dan Architect untuk menyelesaikan proyekmu dari brief sampai gambar kerja.",
      },
    ],
  }),
  component: BabooProyekPage,
});

// Setiap spesialis di dalam layanan Baboo Proyek + keahlian intinya.
const team = [
  {
    key: "mandor" as const,
    skills: [
      "Menerima brief & konteks proyek",
      "Memilih spesialis yang tepat otomatis",
      "Menjaga alur kerja tetap nyambung",
    ],
  },
  {
    key: "civil" as const,
    skills: [
      "Analisis struktur, beban & pondasi",
      "Material dan standar SNI",
      "RAB ringkas & pengecekan teknis",
    ],
  },
  {
    key: "cad" as const,
    skills: [
      "Gambar kerja: denah, potongan, detail",
      "Layer, dimensi & konvensi DWG",
      "Standar penggambaran teknik",
    ],
  },
  {
    key: "architect" as const,
    skills: [
      "Konsep desain & tata ruang",
      "Fasad, sirkulasi & estetika",
      "Kebutuhan ruang & regulasi bangunan",
    ],
  },
];

const flow = [
  {
    num: "01",
    title: "Kirim brief proyek",
    desc: "Ceritakan kebutuhan proyek dan unggah file pendukung — sketsa, foto, PDF, atau DWG.",
  },
  {
    num: "02",
    title: "Mandor mengoordinasi",
    desc: "Baboo Mandor membaca konteks lalu meneruskan tiap bagian ke spesialis yang paling tepat.",
  },
  {
    num: "03",
    title: "Spesialis mengerjakan",
    desc: "Civil, CAD, atau Architect menjawab sesuai keahliannya — lengkap dengan label siapa yang menangani.",
  },
  {
    num: "04",
    title: "Semua di satu ruang",
    desc: "Riwayat, file, dan jawaban seluruh spesialis tersimpan dalam satu proyek yang bisa Anda lanjutkan kapan saja.",
  },
];

function BabooProyekPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Baboo Proyek"
        eyebrowTone="mint"
        title={
          <>
            Satu tim konstruksi, <span className="text-mint-deep">satu layanan</span>
          </>
        }
        desc={PROYEK.desc}
      >
        <CartoonLink to="/dashboard">
          Mulai proyek <ArrowRight className="h-4 w-4" />
        </CartoonLink>
        <CartoonLink to="/kontak" variant="ghost">
          Konsultasi dulu
        </CartoonLink>
      </PageHero>

      {/* Tim di dalam satu layanan */}
      <section className="mx-auto max-w-[1180px] px-7 py-20">
        <SectionHead
          eyebrow="Satu layanan, empat keahlian"
          eyebrowTone="mint"
          title={
            <>
              Empat spesialis yang <span className="text-mint-deep">bekerja bareng</span>
            </>
          }
          desc="Anda tidak perlu memilih agent satu per satu. Baboo Proyek membawa keempatnya sekaligus — Mandor sebagai koordinator, tiga spesialis dengan keahlian masing-masing."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {team.map(({ key, skills }) => {
            const a = AGENTS[key];
            const Icon = a.icon;
            const isLead = key === "mandor";
            return (
              <article
                key={key}
                className={`card-pop card-pop-hover flex flex-col p-7 ${
                  isLead ? "md:col-span-2" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${a.accent}`}
                  >
                    <Icon className="h-7 w-7" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-extrabold text-navy">{a.name}</h3>
                    <p className="text-sm font-semibold uppercase tracking-wide text-mint-deep">
                      {isLead ? "Koordinator" : a.role}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-[15px] opacity-85">{a.desc}</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {skills.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-[14.5px]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint-deep" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* Cara kerja */}
      <section className="bg-cream-deep py-20">
        <div className="mx-auto max-w-[1180px] px-7">
          <SectionHead
            eyebrow="Alur kerja"
            eyebrowTone="sun"
            title={
              <>
                Dari brief ke hasil, <span className="text-mint-deep">tanpa pindah agent</span>
              </>
            }
            desc="Cukup satu percakapan. Mandor yang mengatur siapa mengerjakan apa."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {flow.map((s) => (
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

      {/* Kenapa disatukan */}
      <section className="mx-auto max-w-[1180px] px-7 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow tone="coral">Kenapa satu layanan?</Eyebrow>
            <h2 className="mt-3 font-display text-[clamp(28px,3.6vw,40px)] font-extrabold text-navy">
              Karena proyek nyata <span className="text-mint-deep">butuh banyak keahlian</span>
            </h2>
            <p className="mt-4 text-[16.5px] opacity-85">
              Merancang bangunan bukan cuma soal gambar, atau cuma soal struktur. Anda butuh
              arsitek, insinyur sipil, dan drafter yang saling nyambung. Baboo Proyek
              menempatkan mereka dalam satu tim yang dipimpin Mandor — jadi konteks proyek tidak
              hilang saat berpindah tugas.
            </p>
            <div className="mt-8">
              <CartoonLink to="/dashboard">
                Buka ruang proyek <ArrowRight className="h-4 w-4" />
              </CartoonLink>
            </div>
          </div>

          <div className="card-pop p-7">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-mint">
                <Workflow className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-base font-extrabold text-navy">{PROYEK.name}</p>
                <p className="text-xs opacity-65">{PROYEK.role}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {PROYEK.team.map((a) => {
                const Icon = a.icon;
                return (
                  <div
                    key={a.key}
                    className="flex items-center gap-3 rounded-2xl border-2 border-navy/10 bg-cream px-4 py-3"
                  >
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${a.accent}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-navy">{a.name}</p>
                      <p className="truncate text-xs opacity-70">{a.role}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-full bg-mint/15 px-4 py-2 text-sm font-bold text-mint-deep">
              <Sparkles className="h-4 w-4" />
              Semua tergabung dalam satu proyek
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1180px] px-7 pb-20">
        <div className="card-pop relative overflow-hidden bg-navy p-10 text-center text-cream md:p-14">
          <div className="absolute -left-16 -top-16 h-[180px] w-[180px] rounded-full bg-mint opacity-20" />
          <div className="absolute -bottom-20 -right-20 h-[200px] w-[200px] rounded-full bg-sun opacity-20" />
          <div className="relative">
            <h2 className="font-display text-[clamp(26px,4vw,40px)] font-extrabold">
              Siap jalankan proyekmu bareng satu tim?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[17px] opacity-90">
              Buat proyek, unggah file, dan biarkan Baboo Proyek mengoordinasi spesialis yang
              tepat untuk setiap kebutuhan.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-cream bg-sun px-8 py-3.5 font-display text-base font-bold text-navy-deep shadow-[0_8px_0_rgba(251,247,238,0.15)] transition hover:-translate-y-0.5 active:translate-y-0.5"
              >
                Mulai proyek gratis <ArrowRight className="h-4 w-4" />
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
