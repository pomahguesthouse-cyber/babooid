import { createFileRoute } from "@tanstack/react-router";
import { Target, Eye, Heart } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/page-hero";
import { CartoonLink } from "@/components/cartoon-ui";

export const Route = createFileRoute("/tentang")({
  head: () => ({
    meta: [
      { title: "Tentang kami — Baboo.id" },
      {
        name: "description",
        content:
          "Baboo.id berkomitmen mendemokratisasi AI agar bisa diakses bisnis Indonesia dari berbagai skala.",
      },
      { property: "og:title", content: "Tentang kami — Baboo.id" },
      { property: "og:description", content: "Cerita, visi, dan misi Baboo.id." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Tentang"
        title="Cerita di balik Baboo.id"
        desc="Kami percaya AI seharusnya menjadi alat bantu yang sederhana, terjangkau, dan berdampak nyata bagi bisnis Indonesia."
      />

      <section className="mx-auto max-w-3xl px-7 py-20">
        <p className="text-lg leading-relaxed opacity-90">
          Baboo.id lahir dari pengalaman langsung bekerja bersama pemilik UMKM dan perusahaan
          menengah yang ingin mengadopsi AI, tetapi terhambat oleh kompleksitas teknis dan biaya
          yang tinggi. Kami menyederhanakan semuanya — dari konsultasi, training, hingga integrasi —
          supaya kamu bisa fokus mengembangkan bisnis.
        </p>
        <p className="mt-6 text-lg leading-relaxed opacity-90">
          Tim kami terdiri dari praktisi AI, product designer, dan business strategist yang memahami
          konteks pasar Indonesia. Setiap AI Agent yang kami bangun dirancang untuk berbicara dengan
          natural dan memberikan dampak bisnis terukur.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Target,
              bg: "#E1F5EE",
              stroke: "#0F6E56",
              title: "Misi",
              desc: "Mendemokratisasi AI Agent agar terjangkau bisnis dari skala apapun.",
            },
            {
              icon: Eye,
              bg: "#FAEEDA",
              stroke: "#8A5A00",
              title: "Visi",
              desc: "Menjadi platform AI Agent pilihan utama bisnis di Indonesia.",
            },
            {
              icon: Heart,
              bg: "#FAECE7",
              stroke: "#A63D14",
              title: "Nilai",
              desc: "Sederhana, jujur, dan fokus pada dampak nyata bagi pelanggan.",
            },
          ].map((v) => (
            <div key={v.title} className="card-pop card-pop-hover p-6 text-center">
              <div
                className="mx-auto grid h-12 w-12 place-items-center rounded-2xl"
                style={{ background: v.bg }}
              >
                <v.icon className="h-5 w-5" style={{ color: v.stroke }} />
              </div>
              <h3 className="mt-3 font-display text-lg font-extrabold">{v.title}</h3>
              <p className="mt-2 text-sm opacity-85">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <CartoonLink to="/kontak">Mari berkenalan →</CartoonLink>
        </div>
      </section>
    </SiteShell>
  );
}
