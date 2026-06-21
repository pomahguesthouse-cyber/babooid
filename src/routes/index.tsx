import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  MessageCircle,
  ShoppingBag,
  CalendarCheck,
  Sparkles,
  Bot,
  Clock,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Baboo.id — AI Agent untuk Otomatisasi Bisnis" },
      {
        name: "description",
        content:
          "Transformasi bisnis Anda dengan AI Agent yang siap melayani pelanggan 24/7 — hemat biaya, mudah diintegrasikan, siap pakai dalam hitungan hari.",
      },
    ],
  }),
  component: HomePage,
});

const services = [
  { icon: MessageCircle, title: "AI Customer Service", desc: "Layani pelanggan di WhatsApp & website kapan saja, tanpa antre." },
  { icon: ShoppingBag, title: "AI Sales Agent", desc: "Bantu calon pembeli memilih produk dan tutup penjualan otomatis." },
  { icon: CalendarCheck, title: "AI Booking Agent", desc: "Atur jadwal, reservasi, dan reminder tanpa repot manual." },
  { icon: Bot, title: "AI Agent Kustom", desc: "Dirancang sesuai alur kerja unik industri Anda." },
];

const stats = [
  { value: "24/7", label: "Selalu siap melayani" },
  { value: "70%", label: "Hemat biaya operasional" },
  { value: "<3 dtk", label: "Rata-rata waktu respons" },
  { value: "10x", label: "Lebih cepat tutup deal" },
];

function HomePage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium text-teal backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              AI Agent untuk bisnis Indonesia
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Otomatiskan bisnis Anda dengan <span className="text-gradient">AI Agent</span> yang bekerja 24/7
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              Baboo.id membantu Anda melayani pelanggan, menutup penjualan, dan menjalankan operasional secara otomatis — tanpa perlu paham teknis.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="bg-teal text-navy-deep hover:bg-teal-glow">
                <Link to="/kontak">
                  Konsultasi gratis <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">
                <Link to="/layanan">Lihat layanan</Link>
              </Button>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-2 gap-6 border-t border-white/10 pt-10 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl font-bold text-teal">{s.value}</div>
                <div className="mt-1 text-sm text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Satu platform, banyak AI Agent</h2>
          <p className="mt-4 text-muted-foreground">
            Pilih AI Agent yang paling sesuai dengan kebutuhan bisnis Anda hari ini, dan kembangkan saat bisnis tumbuh.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div key={s.title} className="group rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:shadow-soft">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-teal">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Baboo */}
      <section className="bg-muted/50 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Dibuat untuk pemilik bisnis, bukan engineer</h2>
            <p className="mt-4 text-muted-foreground">
              Anda fokus pada bisnis, kami yang urus AI-nya. Tim Baboo.id menyiapkan, melatih, dan memantau AI Agent Anda agar selalu memberi hasil terbaik.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/cara-kerja">Lihat cara kerja</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/harga">Lihat harga</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Clock, title: "Respons 24/7", desc: "AI Agent siap menjawab pelanggan kapan pun, tanpa lelah." },
              { icon: TrendingUp, title: "Tingkatkan konversi", desc: "Tidak ada lagi calon pembeli yang terlewat." },
              { icon: ShieldCheck, title: "Aman & terkontrol", desc: "Anda tetap pegang kendali penuh atas data dan jawaban AI." },
              { icon: Sparkles, title: "Cepat diaktifkan", desc: "Siap pakai dalam hitungan hari, bukan bulan." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-5">
                <f.icon className="h-5 w-5 text-teal" />
                <h3 className="mt-3 font-display font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-hero p-10 text-center text-primary-foreground sm:p-16">
          <div className="absolute inset-0 grid-pattern opacity-40" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Siap memulai transformasi AI?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              Konsultasi gratis 30 menit untuk memetakan AI Agent terbaik bagi bisnis Anda.
            </p>
            <Button asChild size="lg" className="mt-7 bg-teal text-navy-deep hover:bg-teal-glow">
              <Link to="/kontak">Jadwalkan sekarang <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
