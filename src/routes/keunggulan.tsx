import { createFileRoute } from "@tanstack/react-router";
import { Clock, Wallet, Plug, Settings, Globe, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/keunggulan")({
  head: () => ({
    meta: [
      { title: "Keunggulan — Baboo.id" },
      { name: "description", content: "Respons 24/7, hemat biaya operasional, mudah diintegrasikan, dan dapat dikustomisasi sesuai industri." },
      { property: "og:title", content: "Keunggulan — Baboo.id" },
      { property: "og:description", content: "Alasan bisnis memilih AI Agent Baboo.id." },
    ],
  }),
  component: AdvantagesPage,
});

const items = [
  { icon: Clock, title: "Respons 24/7", desc: "Pelanggan terlayani kapan saja, termasuk akhir pekan dan hari libur." },
  { icon: Wallet, title: "Hemat biaya operasional", desc: "Kurangi beban kerja tim, alokasikan SDM untuk hal yang lebih strategis." },
  { icon: Plug, title: "Mudah diintegrasikan", desc: "Terhubung dengan WhatsApp, website, CRM, dan tools yang sudah Anda pakai." },
  { icon: Settings, title: "Bisa dikustomisasi", desc: "AI Agent disesuaikan dengan brand, produk, dan alur kerja perusahaan." },
  { icon: Globe, title: "Bahasa Indonesia natural", desc: "Memahami konteks lokal dan gaya percakapan pelanggan Indonesia." },
  { icon: ShieldCheck, title: "Aman & terkendali", desc: "Anda tetap punya kendali penuh atas data dan respons AI." },
];

function AdvantagesPage() {
  return (
    <SiteShell>
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Kenapa pilih Baboo.id</h1>
          <p className="mt-4 text-lg text-white/70">
            Dirancang untuk memberi dampak bisnis nyata sejak hari pertama.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div key={i.title} className="rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:shadow-soft">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-teal">
                <i.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{i.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{i.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
