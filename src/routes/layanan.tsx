import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, ShoppingBag, CalendarCheck, Bot, Check } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/page-hero";
import { CartoonLink } from "@/components/cartoon-ui";

export const Route = createFileRoute("/layanan")({
  head: () => ({
    meta: [
      { title: "Layanan AI Agent — Baboo.id" },
      { name: "description", content: "AI Customer Service, AI Sales, AI Booking, dan AI Agent kustom untuk berbagai kebutuhan bisnis Anda." },
      { property: "og:title", content: "Layanan AI Agent — Baboo.id" },
      { property: "og:description", content: "AI Customer Service, AI Sales, AI Booking, dan AI Agent kustom untuk berbagai kebutuhan bisnis Anda." },
    ],
  }),
  component: ServicesPage,
});

const services = [
  {
    icon: MessageCircle,
    title: "AI Customer Service Agent",
    desc: "Layani pelanggan di WhatsApp, Instagram DM, dan live chat website secara otomatis.",
    points: ["Balas pertanyaan umum instan", "Eskalasi ke tim manusia kapan perlu", "Konsisten dengan brand voice Anda"],
  },
  {
    icon: ShoppingBag,
    title: "AI Sales Agent",
    desc: "Pandu calon pembeli memilih produk yang tepat dan tutup penjualan otomatis.",
    points: ["Rekomendasi produk personal", "Follow-up otomatis", "Integrasi dengan katalog & pembayaran"],
  },
  {
    icon: CalendarCheck,
    title: "AI Appointment & Booking",
    desc: "Atur jadwal, reservasi, dan reminder tanpa pekerjaan administrasi manual.",
    points: ["Cek ketersediaan real-time", "Reminder otomatis ke pelanggan", "Sinkron dengan Google Calendar"],
  },
  {
    icon: Bot,
    title: "AI Agent Kustom",
    desc: "Dirancang khusus untuk alur kerja unik di industri Anda.",
    points: ["Analisis kebutuhan mendalam", "Training dengan data perusahaan", "Integrasi sistem internal"],
  },
];

function ServicesPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Layanan"
        title="Layanan AI Agent"
        desc="Solusi otomatisasi end-to-end untuk customer service, penjualan, dan operasional bisnis Anda."
      />

      <section className="mx-auto max-w-[1180px] px-7 py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          {services.map((s) => (
            <div key={s.title} className="card-pop card-pop-hover p-8">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-navy text-mint">
                <s.icon className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-extrabold">{s.title}</h2>
              <p className="mt-2 opacity-85">{s.desc}</p>
              <ul className="mt-5 space-y-2">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint-deep" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <CartoonLink to="/kontak">Diskusi kebutuhan Anda →</CartoonLink>
        </div>
      </section>
    </SiteShell>
  );
}
