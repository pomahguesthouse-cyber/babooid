import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Zap,
  BookCheck,
  Shield,
  Layers,
  MessageSquare,
  Wifi,
  FileText,
  Activity,
  GitBranch,
  Radio,
  Brain,
  Navigation,
  BookOpen,
  Workflow,
  UserCheck,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Baboo AI Agent — Standar Baru untuk Asisten AI Bisnis" },
      {
        name: "description",
        content:
          "Baboo membantu bisnis menjalankan agent AI untuk menjawab chat, membaca data, menjalankan workflow, membuat laporan, dan menjaga operasional tetap bergerak.",
      },
      {
        property: "og:title",
        content: "Baboo AI Agent — Standar Baru untuk Asisten AI Bisnis",
      },
      {
        property: "og:description",
        content:
          "Cepat seperti AI. Rapi seperti operator berpengalaman. Deploy AI agent untuk operasional bisnis Anda.",
      },
    ],
  }),
  component: HomePage,
});

/* ─── Data ─── */

const processSteps = [
  {
    num: "01",
    title: "Activation, simplified",
    desc: "Customer, owner, atau tim cukup mengirim instruksi. Baboo langsung memahami kebutuhan, tujuan, dan konteks bisnis.",
    icon: Zap,
  },
  {
    num: "02",
    title: "Context before action",
    desc: "Bibi membaca SOP, FAQ, database, histori chat, dan aturan bisnis sebelum menjawab atau menjalankan perintah.",
    icon: BookCheck,
  },
  {
    num: "03",
    title: "Agent matched to task",
    desc: "Permintaan diarahkan ke agent yang tepat: customer service, booking, finance, marketing, manager, atau smart home.",
    icon: GitBranch,
  },
  {
    num: "04",
    title: "Execution with control",
    desc: "Baboo menjalankan workflow, mengirim notifikasi, membuat laporan, atau memanggil API dengan log yang bisa diaudit.",
    icon: Shield,
  },
];

const features = [
  {
    icon: Zap,
    title: "Rapid Response",
    desc: "Balas chat dan permintaan pelanggan secara cepat dengan konteks yang tepat.",
  },
  {
    icon: BookCheck,
    title: "Verified Knowledge",
    desc: "Jawaban bersumber dari SOP, database, FAQ, dan aturan bisnis.",
  },
  {
    icon: Shield,
    title: "Controlled Automation",
    desc: "Setiap aksi dapat dibatasi, dilog, dan dialihkan ke manusia saat perlu.",
  },
  {
    icon: Layers,
    title: "Multi-Agent Workflow",
    desc: "Pisahkan peran agent agar setiap tugas ditangani oleh spesialis digital.",
  },
];

const dashboardModules = [
  { icon: Radio, label: "Live Requests", status: "12 aktif" },
  { icon: Navigation, label: "Agent Routing", status: "Auto" },
  { icon: BookOpen, label: "Knowledge Base", status: "Synced" },
  { icon: Workflow, label: "Workflow Actions", status: "3 running" },
  { icon: UserCheck, label: "Human Handoff", status: "Ready" },
];

const faqItems = [
  {
    q: "Apa bedanya Baboo dengan chatbot biasa?",
    a: "Chatbot biasa hanya menjawab pesan. Baboo adalah AI Agent yang bisa membaca data, memilih tool, menjalankan workflow, membuat laporan, dan mengirim notifikasi.",
  },
  {
    q: "Apakah Baboo bisa terhubung ke WhatsApp?",
    a: "Bisa. Baboo dapat dihubungkan ke WhatsApp, Telegram, dashboard internal, database, API, dan sistem lain sesuai kebutuhan.",
  },
  {
    q: "Apakah aksi Baboo bisa dikontrol?",
    a: "Bisa. Setiap agent dapat diberi batasan, approval manusia, log percakapan, dan aturan eskalasi.",
  },
  {
    q: "Bisnis apa yang cocok memakai Baboo?",
    a: "Guesthouse, UMKM, toko online, kontraktor, smart home, customer service, operasional kantor, dan bisnis yang punya tugas berulang.",
  },
];

/* ─── Sub-components ─── */

function FAQItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06]">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-4 text-[15px] font-medium text-white sm:text-base">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[#94A3B8] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-40 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-sm leading-relaxed text-[#94A3B8]">{a}</p>
      </div>
    </div>
  );
}

/* ─── Page ─── */

function HomePage() {
  return (
    <SiteShell>
      <section className="relative min-h-screen overflow-hidden bg-hero flex items-center justify-center">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover z-0"
        >
          <source src="/hero/hero-01.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-[#06131F]/80 z-10" />

        {/* Grid texture */}
        <div className="absolute inset-0 grid-pattern opacity-30 z-20" />

        {/* Ambient glow */}
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-[#67E8F9]/[0.05] blur-[120px] z-20" />

        <div className="relative z-30 mx-auto max-w-7xl px-5 pb-20 pt-32 sm:px-6 sm:pt-36 lg:px-8 lg:pt-44">
          <div className="mx-auto max-w-4xl text-center">
            {/* Section label */}
            <p className="section-label mb-6">Baboo AI Agent</p>

            {/* Headline */}
            <h1 className="font-display text-[2.5rem] font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.25rem]">
              Standar Baru untuk <span className="text-gradient">Asisten AI</span> Bisnis
            </h1>

            {/* Sub-headline */}
            <p className="mx-auto mt-5 max-w-xl text-lg font-medium text-[#94A3B8] sm:text-xl">
              Cepat seperti AI. Rapi seperti operator berpengalaman.
            </p>

            {/* Description */}
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-[#64748B]">
              Baboo membantu bisnis menjalankan agent AI untuk menjawab chat, membaca data,
              menjalankan workflow, membuat laporan, dan menjaga operasional tetap bergerak.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/kontak"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan px-7 py-3.5 text-sm font-semibold text-[#06131F] transition-all hover:bg-teal-glow hover:shadow-cyan"
              >
                Bangun Agent Pertama
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#process"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-7 py-3.5 text-sm font-medium text-white backdrop-blur transition-all hover:bg-white/[0.06]"
              >
                Lihat Cara Kerja
              </a>
            </div>

            {/* Scroll hint */}
            <p className="mt-12 text-xs text-[#475569]">Scroll untuk melihat proses Baboo ↓</p>
          </div>

          {/* ── Hero Card: Bibi Dashboard ── */}
          <div id="agent" className="mx-auto mt-16 max-w-3xl scroll-mt-24">
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan/10">
                    <Brain className="h-5 w-5 text-cyan" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Bibi — AI Operations Assistant
                    </p>
                    <p className="text-xs text-[#64748B]">Last sync 2 min ago</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                  Online
                </span>
              </div>

              {/* Status chips */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
                  <MessageSquare className="h-4 w-4 text-cyan" />
                  <div>
                    <p className="text-sm font-medium text-white">12 chat dijawab</p>
                    <p className="text-xs text-[#64748B]">Semua terespon &lt;30 detik</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
                  <Activity className="h-4 w-4 text-[#F59E0B]" />
                  <div>
                    <p className="text-sm font-medium text-white">3 booking perlu konfirmasi</p>
                    <p className="text-xs text-[#64748B]">Menunggu approval owner</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
                  <FileText className="h-4 w-4 text-emerald" />
                  <div>
                    <p className="text-sm font-medium text-white">Laporan harian siap dikirim</p>
                    <p className="text-xs text-[#64748B]">Revenue, occupancy, chat summary</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
                  <Wifi className="h-4 w-4 text-cyan" />
                  <div>
                    <p className="text-sm font-medium text-white">API connected</p>
                    <p className="text-xs text-[#64748B]">WhatsApp, DB, Dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 2. PROCESS ═══ */}
      <section id="process" className="relative scroll-mt-20 bg-[#06131F]">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative mx-auto max-w-7xl px-5 py-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-label mb-4">Process</p>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-[2.75rem]">
              Dari permintaan masuk sampai aksi selesai.
            </h2>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step) => (
              <div
                key={step.num}
                className="group glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan/20 hover:shadow-cyan"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gradient font-display text-2xl font-bold">{step.num}</span>
                  <step.icon className="h-5 w-5 text-[#94A3B8] transition-colors group-hover:text-cyan" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. PLATFORM FEATURES ═══ */}
      <section id="platform" className="relative scroll-mt-20 bg-[#071927]">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative mx-auto max-w-7xl px-5 py-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-label mb-4">Platform</p>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-[2.75rem]">
              Dirancang untuk operasi modern, bukan chatbot lama.
            </h2>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="group glass-card rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-cyan/20 hover:shadow-cyan"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan/10 transition-colors group-hover:bg-cyan/15">
                  <f.icon className="h-5 w-5 text-cyan" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. STATEMENT + DASHBOARD ═══ */}
      <section id="usecase" className="relative scroll-mt-20 bg-[#06131F]">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        {/* Ambient glow */}
        <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-[#67E8F9]/[0.04] blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-label mb-4">Use Case</p>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-[2.75rem]">
              Human-grade standards for AI-powered operations.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[#94A3B8]">
              Baboo dibuat untuk bisnis yang butuh kecepatan AI tanpa kehilangan kontrol manusia.
              Setiap agent bekerja dengan batasan, SOP, dan audit trail.
            </p>
          </div>

          {/* Operations dashboard card */}
          <div className="mx-auto mt-14 max-w-4xl">
            <div className="glass-card overflow-hidden rounded-2xl">
              {/* Card header */}
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-6 py-4">
                <div className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
                <span className="ml-3 text-xs text-[#64748B]">Baboo Operations Dashboard</span>
              </div>

              {/* Dashboard grid */}
              <div className="grid gap-px bg-white/[0.04] sm:grid-cols-5">
                {dashboardModules.map((mod) => (
                  <div
                    key={mod.label}
                    className="flex flex-col items-center gap-2 bg-[#071927] px-4 py-8 transition-colors hover:bg-white/[0.02]"
                  >
                    <mod.icon className="h-5 w-5 text-cyan" />
                    <p className="text-xs font-medium text-white">{mod.label}</p>
                    <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-medium text-[#94A3B8]">
                      {mod.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Activity bar */}
              <div className="flex items-center justify-between border-t border-white/[0.06] px-6 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald" />
                  <span className="text-xs text-[#64748B]">System operational — 99.9% uptime</span>
                </div>
                <span className="text-xs text-[#475569]">Updated just now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5. FAQ ═══ */}
      <section id="faq" className="relative scroll-mt-20 bg-[#071927]">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative mx-auto max-w-3xl px-5 py-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-label mb-4">FAQ</p>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Cara Baboo bekerja di bisnis Anda.
            </h2>
          </div>

          <div className="mt-14">
            {faqItems.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. FINAL CTA ═══ */}
      <section className="relative bg-[#06131F]">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        {/* Ambient glow */}
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#67E8F9]/[0.06] blur-[120px]" />

        <div className="relative mx-auto max-w-3xl px-5 py-28 text-center sm:px-6 lg:px-8">
          <p className="section-label mb-4">Get Started</p>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Bangun AI Agent yang benar-benar bekerja.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[#94A3B8]">
            Mulai dari satu agent sederhana, lalu berkembang menjadi sistem operasi AI untuk bisnis
            Anda.
          </p>
          <Link
            to="/kontak"
            className="mt-10 inline-flex items-center gap-2 rounded-xl bg-cyan px-8 py-4 text-sm font-semibold text-[#06131F] transition-all hover:bg-teal-glow hover:shadow-cyan"
          >
            Konsultasi Gratis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
