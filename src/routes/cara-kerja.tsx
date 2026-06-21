import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, Cog, Plug, LineChart } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

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
      <section className="bg-hero text-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Cara kerja</h1>
          <p className="mt-4 text-lg text-white/70">
            Empat tahap sederhana, transparan, dan terukur — dari konsultasi pertama sampai AI Agent
            berjalan optimal.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <ol className="relative space-y-8 border-l-2 border-dashed border-border pl-8">
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="absolute -left-[2.4rem] grid h-12 w-12 place-items-center rounded-full bg-navy text-teal font-display font-bold">
                {i + 1}
              </span>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <s.icon className="h-5 w-5 text-teal" />
                  <h2 className="font-display text-xl font-semibold">{s.title}</h2>
                </div>
                <p className="mt-2 text-muted-foreground">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-14 text-center">
          <Button asChild size="lg">
            <Link to="/kontak">Mulai langkah pertama</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
