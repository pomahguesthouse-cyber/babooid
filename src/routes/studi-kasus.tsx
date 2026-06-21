import { createFileRoute, Link } from "@tanstack/react-router";
import { Quote } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/studi-kasus")({
  head: () => ({
    meta: [
      { title: "Studi kasus & testimoni — Baboo.id" },
      { name: "description", content: "Cerita bisnis Indonesia yang meningkatkan layanan dan penjualan dengan AI Agent Baboo.id." },
      { property: "og:title", content: "Studi kasus & testimoni — Baboo.id" },
      { property: "og:description", content: "Hasil nyata dari berbagai industri." },
    ],
  }),
  component: CaseStudyPage,
});

const cases = [
  { brand: "Toko Aksara", industry: "Retail fashion", result: "+38% konversi chat menjadi order, respons rata-rata 2 detik." },
  { brand: "Klinik Sehat Bersama", industry: "Kesehatan", result: "Reservasi otomatis menghemat 25 jam admin per minggu." },
  { brand: "Kopi Nusantara", industry: "F&B", result: "Reorder pelanggan naik 22% berkat follow-up AI Agent." },
];

const testimonials = [
  { name: "Rina P.", role: "Owner, Aksara Boutique", quote: "AI Agent Baboo membalas pelanggan saya bahkan saat saya tidur. Penjualan tetap jalan." },
  { name: "dr. Bagas", role: "Direktur Klinik Sehat", quote: "Pasien terbantu pesan jadwal lewat WhatsApp, staf saya bisa fokus melayani pasien di tempat." },
  { name: "Anton W.", role: "CEO Kopi Nusantara", quote: "Tim Baboo cepat tanggap. Onboarding hanya beberapa hari dan langsung kelihatan hasilnya." },
];

function CaseStudyPage() {
  return (
    <SiteShell>
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Studi kasus & testimoni</h1>
          <p className="mt-4 text-lg text-white/70">
            Bisnis Indonesia yang merasakan dampak nyata dari AI Agent kami.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {cases.map((c) => (
            <div key={c.brand} className="rounded-2xl border border-border bg-card p-6">
              <div className="text-xs font-medium uppercase tracking-wider text-teal">{c.industry}</div>
              <h3 className="mt-2 font-display text-xl font-semibold">{c.brand}</h3>
              <p className="mt-3 text-muted-foreground">{c.result}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-20 text-center font-display text-3xl font-bold">Apa kata mereka</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl bg-muted/60 p-6">
              <Quote className="h-6 w-6 text-teal" />
              <blockquote className="mt-3 text-sm leading-relaxed">"{t.quote}"</blockquote>
              <figcaption className="mt-4 text-sm font-medium">
                {t.name} <span className="font-normal text-muted-foreground">— {t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Button asChild size="lg">
            <Link to="/kontak">Mau jadi cerita sukses berikutnya?</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
