import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Cog, Plug, LineChart } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/page-hero";
import { CartoonLink } from "@/components/cartoon-ui";

export const Route = createFileRoute("/cara-kerja")({
  head: () => ({
    meta: [
      { title: "Cara kerja — Baboo.id" },
      {
        name: "description",
        content:
          "Empat tahap sederhana: konsultasi, setup AI, integrasi, lalu monitoring dan optimasi berkelanjutan.",
      },
      { property: "og:title", content: "Cara kerja — Baboo.id" },
      {
        property: "og:description",
        content: "Dari konsultasi sampai go-live, prosesnya transparan dan cepat.",
      },
    ],
  }),
  component: HowItWorksPage,
});

const steps = [
  {
    icon: MessageSquare,
    title: "Konsultasi",
    desc: "Kami pahami bisnis, target pelanggan, dan masalah yang ingin diselesaikan.",
  },
  {
    icon: Cog,
    title: "Setup & training AI",
    desc: "AI Agent dirancang dan dilatih menggunakan data serta brand voice perusahaan Anda.",
  },
  {
    icon: Plug,
    title: "Integrasi platform",
    desc: "Hubungkan ke WhatsApp Business, website, CRM, atau sistem internal.",
  },
  {
    icon: LineChart,
    title: "Monitoring & optimasi",
    desc: "Pantau performa, lakukan iterasi, dan terus tingkatkan hasil.",
  },
];

function HowItWorksPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Cara kerja"
        eyebrowTone="sun"
        title="Empat langkah, Bibi siap kerja"
        desc="Sederhana, transparan, dan terukur — dari konsultasi pertama sampai AI Agent berjalan optimal."
      />

      <section className="mx-auto max-w-3xl px-7 py-20">
        <ol className="relative space-y-8 border-l-[3px] border-dashed border-navy pl-10">
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="absolute -left-[3.1rem] grid h-12 w-12 place-items-center rounded-full border-[3px] border-cream bg-navy font-display text-lg font-extrabold text-cream shadow-[0_0_0_3px_#13294B]">
                {i + 1}
              </span>
              <div className="card-pop p-6">
                <div className="flex items-center gap-3">
                  <s.icon className="h-5 w-5 text-mint-deep" />
                  <h2 className="font-display text-xl font-extrabold">{s.title}</h2>
                </div>
                <p className="mt-2 opacity-85">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-14 text-center">
          <CartoonLink to="/kontak">Mulai langkah pertama →</CartoonLink>
        </div>
      </section>
    </SiteShell>
  );
}
