import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/harga")({
  head: () => ({
    meta: [
      { title: "Harga & paket — Baboo.id" },
      {
        name: "description",
        content:
          "Paket Starter, Business, dan Enterprise yang fleksibel untuk berbagai skala bisnis.",
      },
      { property: "og:title", content: "Harga & paket — Baboo.id" },
      { property: "og:description", content: "Pilih paket yang sesuai dengan skala bisnis Anda." },
    ],
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "Starter",
    price: "Rp 1.500.000",
    suffix: "/bulan",
    desc: "Cocok untuk UMKM yang baru memulai otomatisasi.",
    features: [
      "1 AI Agent (Customer Service)",
      "Integrasi WhatsApp atau website",
      "Hingga 2.000 percakapan/bulan",
      "Dashboard dasar",
      "Dukungan email",
    ],
    highlighted: false,
  },
  {
    name: "Business",
    price: "Rp 4.500.000",
    suffix: "/bulan",
    desc: "Untuk bisnis berkembang yang butuh lebih banyak agent.",
    features: [
      "Hingga 3 AI Agent",
      "Integrasi WhatsApp, website, & CRM",
      "Hingga 10.000 percakapan/bulan",
      "Training brand voice kustom",
      "Dukungan prioritas",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Kustom",
    suffix: "",
    desc: "Solusi tailor-made untuk perusahaan menengah & besar.",
    features: [
      "AI Agent tanpa batas",
      "Integrasi sistem internal",
      "Percakapan tanpa batas",
      "Account manager khusus",
      "SLA & onboarding penuh",
    ],
    highlighted: false,
  },
];

function PricingPage() {
  return (
    <SiteShell>
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Harga & paket</h1>
          <p className="mt-4 text-lg text-white/70">
            Transparan, fleksibel, dan bisa upgrade kapan saja sesuai pertumbuhan bisnis.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={
                p.highlighted
                  ? "relative rounded-3xl border-2 border-teal bg-navy p-8 text-primary-foreground shadow-glow"
                  : "rounded-3xl border border-border bg-card p-8"
              }
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal px-3 py-1 text-xs font-semibold text-navy-deep">
                  Paling populer
                </span>
              )}
              <h3 className="font-display text-xl font-semibold">{p.name}</h3>
              <p
                className={
                  p.highlighted
                    ? "mt-2 text-sm text-white/70"
                    : "mt-2 text-sm text-muted-foreground"
                }
              >
                {p.desc}
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{p.price}</span>
                <span
                  className={
                    p.highlighted ? "text-sm text-white/60" : "text-sm text-muted-foreground"
                  }
                >
                  {p.suffix}
                </span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check
                      className={
                        p.highlighted
                          ? "mt-0.5 h-4 w-4 shrink-0 text-teal"
                          : "mt-0.5 h-4 w-4 shrink-0 text-teal"
                      }
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={
                  p.highlighted
                    ? "mt-8 w-full bg-teal text-navy-deep hover:bg-teal-glow"
                    : "mt-8 w-full"
                }
                variant={p.highlighted ? "default" : "outline"}
              >
                <Link to="/kontak">
                  {p.name === "Enterprise" ? "Hubungi sales" : "Pilih paket"}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Semua paket termasuk uji coba 14 hari dan dapat dibatalkan kapan saja.
        </p>
      </section>
    </SiteShell>
  );
}
