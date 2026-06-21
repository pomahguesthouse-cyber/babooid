import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { BibiMascot, BibiWave } from "@/components/bibi-mascot";
import { CartoonLink, Eyebrow, SectionHead } from "@/components/cartoon-ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Baboo.id — AI Agent yang siap bantu bisnismu" },
      {
        name: "description",
        content:
          "Bibi, AI Agent dari Baboo.id, membalas chat, menjawab pertanyaan, dan menutup penjualan 24 jam non-stop — supaya kamu bisa fokus mengurus hal lain.",
      },
    ],
  }),
  component: HomePage,
});

const services = [
  {
    bg: "#E1F5EE",
    stroke: "#0F6E56",
    title: "AI Customer Service",
    desc: "Balas chat WhatsApp dan website secara instan, ramah, dan konsisten — kapan pun pelanggan datang.",
    icon: <path d="M4 5h16v11H8l-4 4V5z" stroke="#0F6E56" strokeWidth="2" strokeLinejoin="round" />,
  },
  {
    bg: "#FAEEDA",
    stroke: "#8A5A00",
    title: "AI Sales Agent",
    desc: "Rekomendasikan produk yang pas dan dorong pelanggan sampai checkout, tanpa terasa memaksa.",
    icon: (
      <>
        <path d="M3 12l8-8 9 9-8 8-9-9z" stroke="#8A5A00" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="15" cy="9" r="1.4" fill="#8A5A00" />
      </>
    ),
  },
  {
    bg: "#FAECE7",
    stroke: "#A63D14",
    title: "AI Booking Agent",
    desc: "Atur jadwal dan reservasi otomatis lewat chat, tanpa perlu admin yang standby terus-menerus.",
    icon: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" stroke="#A63D14" strokeWidth="2" />
        <path d="M4 9h16M9 3v4M15 3v4" stroke="#A63D14" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  {
    bg: "#EEEDFE",
    stroke: "#3C3489",
    title: "AI Agent Kustom",
    desc: "Punya alur kerja unik? Kami latih Bibi versi khusus sesuai kebutuhan dan sistem bisnismu.",
    icon: (
      <path
        d="M12 3l2 4 4.5.6-3.3 3.1.9 4.4L12 13l-4.1 2.1.9-4.4L5.5 7.6 10 7l2-4z"
        stroke="#3C3489"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    ),
  },
];

const steps = [
  { n: 1, title: "Konsultasi", desc: "Cerita soal bisnismu, kami bantu pilih peran Bibi yang paling pas." },
  { n: 2, title: "Latih Bibi", desc: "Bibi dilatih pakai data dan gaya bicara brand kamu sendiri." },
  { n: 3, title: "Hubungkan", desc: "Sambungkan ke WhatsApp, website, atau CRM favoritmu." },
  { n: 4, title: "Pantau hasil", desc: "Lihat performa Bibi lewat dashboard dan terus disempurnakan." },
];

const stats = [
  { num: "<5s", label: "Waktu respon rata-rata", color: "#5DCAA5", rot: "-rotate-2" },
  { num: "24/7", label: "Selalu siap sedia", color: "#FFC857", rot: "rotate-[1.5deg]" },
  { num: "70%", label: "Hemat biaya operasional CS", color: "#FF8C69", rot: "-rotate-1" },
  { num: "1000+", label: "Percakapan bersamaan", color: "#85B7EB", rot: "rotate-2" },
];

const testimonials = [
  {
    quote: "Sejak ada Bibi, waktu balas chat turun drastis. Tim kami bisa fokus ke hal yang lebih strategis.",
    name: "Rani A.",
    role: "Owner, Kedai Kopi Lima",
    initials: "RA",
    color: "#1D9E75",
  },
  {
    quote: "AI Sales Agent-nya bantu naikkan konversi tanpa harus nambah tim sales baru.",
    name: "Dimas P.",
    role: "Marketing Lead, Rumahin",
    initials: "DP",
    color: "#185FA5",
  },
  {
    quote: "Setup-nya cepat banget, dan Bibi benar-benar ngerti gaya bicara brand kami.",
    name: "Sinta Y.",
    role: "CEO, Klinik Sehat Hati",
    initials: "SY",
    color: "#993C1D",
  },
];

function HomePage() {
  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative overflow-hidden pt-16 pb-10">
        <div className="absolute -left-24 -top-16 h-[260px] w-[260px] rounded-full bg-mint opacity-35 blur-[2px]" />
        <div className="absolute bottom-8 left-[6%] h-[180px] w-[180px] rounded-full bg-sun opacity-40" />
        <div className="absolute -right-20 top-[10%] h-[220px] w-[220px] rounded-full bg-teal opacity-30" />

        <div className="relative z-10 mx-auto grid max-w-[1180px] items-center gap-12 px-7 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <Eyebrow>AI Agent untuk bisnismu</Eyebrow>
            <h1 className="mt-4 font-display text-[clamp(36px,5.2vw,58px)] font-extrabold leading-[1.1] text-navy">
              Bisnismu butuh bantuan? <span className="text-mint-deep">Panggil Bibi.</span>
            </h1>
            <p className="mt-5 max-w-[480px] text-[18px]">
              Bibi adalah AI Agent dari Baboo.id yang membalas chat, menjawab pertanyaan, dan menutup penjualan — sambil
              kamu fokus mengurus hal lain. Aktif 24 jam, tanpa lelah, tanpa cuti.
            </p>
            <div className="mt-7 flex flex-wrap gap-3.5">
              <CartoonLink to="/kontak">Coba demo Bibi →</CartoonLink>
              <CartoonLink to="/layanan" variant="ghost">
                Lihat layanan
              </CartoonLink>
            </div>
            <div className="mt-7 flex flex-wrap gap-5">
              {["RESPON <5 DETIK", "AKTIF 24/7", "HEMAT 70% BIAYA CS"].map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-2 rounded-[14px] border-2 border-navy bg-cream-deep px-3.5 py-2 font-mono text-[12.5px] font-bold"
                >
                  <i className="inline-block h-2 w-2 rounded-full bg-mint-deep" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Browser + chat */}
          <div className="relative">
            <div className="relative z-10 rotate-[2deg] rounded-[24px] bg-navy p-3.5 shadow-soft">
              <div className="mb-2.5 flex gap-1.5 pl-1">
                <span className="h-2.5 w-2.5 rounded-full bg-white/35" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/35" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/35" />
              </div>
              <div className="relative min-h-[300px] overflow-hidden rounded-[14px] bg-cream p-5">
                <ChatRow side="bot" avatar="B" text="Halo! Aku Bibi 👋 Ada yang bisa dibantu hari ini?" />
                <ChatRow side="user" avatar="A" text="Mau tanya paket Business dong" />
                <ChatRow side="bot" avatar="B" text="Siap! Paket Business cocok untuk bisnis yang sedang naik daun 🌱" />
                <svg
                  className="animate-twinkle absolute right-3.5 top-2.5 text-sun"
                  width="20"
                  height="20"
                  viewBox="0 0 16 16"
                  aria-hidden
                >
                  <path d="M8 1l1.6 4.7L14 7l-4.4 1.3L8 13l-1.6-4.7L2 7l4.4-1.3L8 1z" fill="currentColor" />
                </svg>
              </div>
            </div>
            <div className="animate-bob absolute -bottom-6 -right-4 z-20 w-[150px]">
              <BibiMascot />
            </div>
          </div>
        </div>
      </section>

      {/* WAVE */}
      <div className="wave-divider-cream h-[60px] w-full" />

      {/* LAYANAN */}
      <section className="bg-cream-deep py-24">
        <div className="mx-auto max-w-[1180px] px-7">
          <SectionHead
            eyebrow="Layanan"
            eyebrowTone="mint"
            title="Satu Bibi, banyak peran"
            desc="Pilih peran yang paling dibutuhkan bisnismu sekarang — atau gabungkan semuanya dalam satu AI Agent."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <div
                key={s.title}
                className="card-pop card-pop-hover p-6"
              >
                <div
                  className="mb-4 grid h-[54px] w-[54px] place-items-center rounded-2xl"
                  style={{ background: s.bg }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    {s.icon}
                  </svg>
                </div>
                <h3 className="text-lg font-extrabold">{s.title}</h3>
                <p className="mt-2 text-[14.5px] opacity-85">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="py-24">
        <div className="mx-auto max-w-[1180px] px-7">
          <SectionHead
            eyebrow="Cara kerja"
            eyebrowTone="sun"
            title="Empat langkah, Bibi siap kerja"
            desc="Dari kenalan sampai live di channel bisnismu — biasanya selesai dalam hitungan hari, bukan bulan."
          />
          <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div
              className="pointer-events-none absolute left-[6%] right-[6%] top-7 hidden h-[3px] lg:block"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #13294B 0 10px, transparent 10px 20px)",
                backgroundSize: "20px 3px",
                backgroundRepeat: "repeat-x",
              }}
            />
            {steps.map((s) => (
              <div key={s.n} className="relative z-10 text-center">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border-[3px] border-cream bg-navy font-display text-[22px] font-extrabold text-cream shadow-[0_0_0_3px_#13294B]">
                  {s.n}
                </div>
                <h4 className="text-[16.5px] font-extrabold">{s.title}</h4>
                <p className="mt-1.5 text-sm opacity-80">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KEUNGGULAN — DARK */}
      <section className="bg-navy py-24 text-cream">
        <div className="mx-auto max-w-[1180px] px-7">
          <div className="mx-auto mb-12 max-w-[620px] text-center">
            <Eyebrow tone="cream">Keunggulan</Eyebrow>
            <h2 className="mt-3 font-display text-[clamp(28px,3.6vw,40px)] font-extrabold text-cream">
              Kenapa bisnis pilih Bibi
            </h2>
            <p className="mt-3 text-cream/75">
              Bukan sekadar chatbot — Bibi adalah rekan kerja digital yang benar-benar diandalkan.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className={`${s.rot} rounded-[18px] border border-white/10 bg-navy-deep px-5 py-6 text-center`}
              >
                <div className="font-display text-[32px] font-extrabold" style={{ color: s.color }}>
                  {s.num}
                </div>
                <div className="mt-1.5 text-[13.5px] text-cream/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONI */}
      <section className="py-24">
        <div className="mx-auto max-w-[1180px] px-7">
          <SectionHead
            eyebrow="Cerita pengguna"
            eyebrowTone="coral"
            title="Sudah dipercaya bisnis yang bertumbuh"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-[20px] border-[2.5px] border-dashed border-navy bg-white p-6"
              >
                <p className="mb-4 text-[14.5px]">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-2.5">
                  <div
                    className="grid h-9 w-9 place-items-center rounded-full font-display text-[13px] font-bold text-white"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{t.name}</div>
                    <div className="text-[12.5px] opacity-65">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HARGA RINGKAS */}
      <section className="bg-cream-deep py-24">
        <div className="mx-auto max-w-[1180px] px-7">
          <SectionHead
            eyebrow="Harga"
            eyebrowTone="mint"
            title="Pilih paket yang sesuai langkahmu"
            desc="Mulai kecil, kembangkan kapan saja. Tanpa kontrak mengikat."
          />
          <div className="text-center">
            <CartoonLink to="/harga">Lihat semua paket →</CartoonLink>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-[1180px] px-7">
          <div className="relative grid items-center gap-8 overflow-hidden rounded-[32px] p-10 sm:p-14 lg:grid-cols-[1fr_260px]"
               style={{ background: "linear-gradient(135deg, #FFC857 0%, #FF8C69 100%)" }}>
            <div>
              <Eyebrow tone="mint">Yuk mulai</Eyebrow>
              <h2 className="mt-3 font-display text-[clamp(26px,3.4vw,38px)] font-extrabold text-navy-deep">
                Bibi siap kerja sebelum kamu selesai baca ini.
              </h2>
              <p className="mt-3 max-w-[440px] text-navy-deep/85">
                Konsultasi gratis 30 menit, lihat langsung bagaimana Bibi bisa membantu bisnismu.
              </p>
              <div className="mt-6 flex flex-wrap gap-3.5">
                <a
                  href="https://wa.me/6281234567890"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-navy-deep bg-cream px-7 py-3.5 font-display font-bold text-navy-deep shadow-[0_6px_0_rgba(11,27,46,0.45)] transition hover:-translate-y-0.5"
                >
                  Chat WhatsApp →
                </a>
                <Link
                  to="/kontak"
                  className="inline-flex items-center justify-center rounded-full border-[3px] border-navy-deep bg-transparent px-7 py-3.5 font-display font-bold text-navy-deep hover:bg-navy-deep hover:text-cream"
                >
                  halo@baboo.id
                </Link>
              </div>
            </div>
            <BibiWave className="mx-auto h-auto w-[200px]" />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function ChatRow({ side, avatar, text }: { side: "bot" | "user"; avatar: string; text: string }) {
  const isUser = side === "user";
  return (
    <div className={`mb-3.5 flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`grid h-[34px] w-[34px] flex-none place-items-center rounded-full font-display text-[13px] font-bold ${
          isUser ? "bg-navy text-cream" : "bg-mint text-navy-deep"
        }`}
      >
        {avatar}
      </div>
      <div
        className={`max-w-[230px] border-2 border-navy bg-white px-3.5 py-2.5 text-sm font-semibold ${
          isUser ? "rounded-[14px] rounded-tr-[4px] bg-sun" : "rounded-[14px] rounded-bl-[4px]"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
