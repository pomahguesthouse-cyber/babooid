import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/page-hero";

export const Route = createFileRoute("/harga")({
  head: () => ({
    meta: [
      { title: "Harga & paket — Baboo.id" },
      { name: "description", content: "Paket Starter, Business, dan Enterprise yang fleksibel untuk berbagai skala bisnis." },
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
    features: ["1 AI Agent (Customer Service)", "Integrasi WhatsApp atau website", "Hingga 2.000 percakapan/bulan", "Dashboard dasar", "Dukungan email"],
    highlighted: false,
  },
  {
    name: "Business",
    price: "Rp 4.500.000",
    suffix: "/bulan",
    desc: "Untuk bisnis berkembang yang butuh lebih banyak agent.",
    features: ["Hingga 3 AI Agent", "Integrasi WhatsApp, website, & CRM", "Hingga 10.000 percakapan/bulan", "Training brand voice kustom", "Dukungan prioritas"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Kustom",
    suffix: "",
    desc: "Solusi tailor-made untuk perusahaan menengah & besar.",
    features: ["AI Agent tanpa batas", "Integrasi sistem internal", "Percakapan tanpa batas", "Account manager khusus", "SLA & onboarding penuh"],
    highlighted: false,
  },
];

function PricingPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Harga"
        title="Pilih paket yang sesuai langkahmu"
        desc="Mulai kecil, kembangkan kapan saja. Tanpa kontrak mengikat."
      />

      <section className="mx-auto max-w-[1180px] px-7 py-20">
        <div className="grid items-start gap-7 lg:grid-cols-3">
          {plans.map((p) => {
            const featured = p.highlighted;
            return (
              <div
                key={p.name}
                className={
                  featured
                    ? "relative rounded-[22px] border-[2.5px] border-navy bg-navy p-8 text-cream shadow-[0_16px_0_rgba(19,41,75,0.18)] lg:scale-[1.05]"
                    : "relative card-pop p-8"
                }
              >
                {featured && (
                  <span className="absolute -top-4 right-5 rotate-6 rounded-[10px] bg-coral px-3 py-1.5 font-mono text-[11.5px] font-bold text-white shadow-[3px_3px_0_rgba(0,0,0,0.15)]">
                    Paling populer
                  </span>
                )}
                <h3 className={`font-display text-xl font-extrabold ${featured ? "text-cream" : ""}`}>{p.name}</h3>
                <p className={`mt-1 text-[13.5px] ${featured ? "text-cream/70" : "opacity-70"}`}>{p.desc}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className={`font-display text-[30px] font-extrabold ${featured ? "text-cream" : "text-navy"}`}>
                    {p.price}
                  </span>
                  <span className={`text-sm font-semibold ${featured ? "text-cream/70" : "opacity-70"}`}>{p.suffix}</span>
                </div>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "text-mint" : "text-mint-deep"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/kontak"
                  className={
                    featured
                      ? "mt-7 inline-flex w-full items-center justify-center rounded-full border-[3px] border-navy-deep bg-sun px-5 py-3 font-display font-bold text-navy-deep shadow-[0_6px_0_rgba(11,27,46,0.35)] transition hover:-translate-y-0.5"
                      : "mt-7 inline-flex w-full items-center justify-center rounded-full border-[3px] border-navy bg-transparent px-5 py-3 font-display font-bold text-navy hover:bg-navy hover:text-cream"
                  }
                >
                  {p.name === "Enterprise" ? "Hubungi sales" : `Pilih ${p.name}`}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm opacity-70">
          Semua paket termasuk uji coba 14 hari dan dapat dibatalkan kapan saja.
        </p>
      </section>
    </SiteShell>
  );
}
