import { createFileRoute } from "@tanstack/react-router";
import { Quote } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/page-hero";
import { CartoonLink } from "@/components/cartoon-ui";

export const Route = createFileRoute("/studi-kasus")({
  head: () => ({
    meta: [
      { title: "Cerita pengguna — Baboo.id" },
      {
        name: "description",
        content:
          "Cerita bisnis Indonesia yang meningkatkan layanan dan penjualan dengan AI Agent Baboo.id.",
      },
      { property: "og:title", content: "Cerita pengguna — Baboo.id" },
      { property: "og:description", content: "Hasil nyata dari berbagai industri." },
    ],
  }),
  component: CaseStudyPage,
});

const cases = [
  {
    brand: "Toko Aksara",
    industry: "Retail fashion",
    result: "+38% konversi chat menjadi order, respons rata-rata 2 detik.",
    color: "#1D9E75",
  },
  {
    brand: "Klinik Sehat Bersama",
    industry: "Kesehatan",
    result: "Reservasi otomatis menghemat 25 jam admin per minggu.",
    color: "#8A5A00",
  },
  {
    brand: "Kopi Nusantara",
    industry: "F&B",
    result: "Reorder pelanggan naik 22% berkat follow-up AI Agent.",
    color: "#A63D14",
  },
];

const testimonials = [
  {
    name: "Rina P.",
    role: "Owner, Aksara Boutique",
    quote: "AI Agent Baboo membalas pelanggan saya bahkan saat saya tidur. Penjualan tetap jalan.",
    initials: "RP",
    color: "#1D9E75",
  },
  {
    name: "dr. Bagas",
    role: "Direktur Klinik Sehat",
    quote:
      "Pasien terbantu pesan jadwal lewat WhatsApp, staf saya bisa fokus melayani pasien di tempat.",
    initials: "BG",
    color: "#185FA5",
  },
  {
    name: "Anton W.",
    role: "CEO Kopi Nusantara",
    quote:
      "Tim Baboo cepat tanggap. Onboarding hanya beberapa hari dan langsung kelihatan hasilnya.",
    initials: "AW",
    color: "#993C1D",
  },
];

function CaseStudyPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Cerita pengguna"
        eyebrowTone="coral"
        title="Cerita bisnis yang bertumbuh bersama Bibi"
        desc="Bisnis Indonesia yang merasakan dampak nyata dari AI Agent kami."
      />

      <section className="mx-auto max-w-[1180px] px-7 py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {cases.map((c) => (
            <div key={c.brand} className="card-pop card-pop-hover p-6">
              <div
                className="font-mono text-[12px] font-bold uppercase tracking-wider"
                style={{ color: c.color }}
              >
                {c.industry}
              </div>
              <h3 className="mt-2 font-display text-xl font-extrabold">{c.brand}</h3>
              <p className="mt-3 opacity-85">{c.result}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-20 text-center font-display text-3xl font-extrabold">Apa kata mereka</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="rounded-[20px] border-[2.5px] border-dashed border-navy bg-white p-6"
            >
              <Quote className="h-6 w-6 text-mint-deep" />
              <blockquote className="mt-3 text-[14.5px] leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-2.5">
                <span
                  className="grid h-9 w-9 place-items-center rounded-full font-display text-[13px] font-bold text-white"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </span>
                <span className="text-sm font-bold">
                  {t.name}
                  <span className="block text-[12.5px] font-medium opacity-65">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-14 text-center">
          <CartoonLink to="/kontak">Mau jadi cerita berikutnya? →</CartoonLink>
        </div>
      </section>
    </SiteShell>
  );
}
