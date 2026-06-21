import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Eye, Heart } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

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
      <section className="bg-hero text-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Tentang Baboo.id</h1>
          <p className="mt-4 text-lg text-white/70">
            Kami percaya AI seharusnya menjadi alat bantu yang sederhana, terjangkau, dan berdampak
            nyata bagi bisnis Indonesia.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="prose prose-neutral max-w-none">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Baboo.id lahir dari pengalaman langsung bekerja bersama pemilik UMKM dan perusahaan
            menengah yang ingin mengadopsi AI, tetapi terhambat oleh kompleksitas teknis dan biaya
            yang tinggi. Kami menyederhanakan semuanya — dari konsultasi, training, hingga integrasi
            — sehingga Anda dapat fokus mengembangkan bisnis.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Tim kami terdiri dari praktisi AI, product designer, dan business strategist yang
            memahami konteks pasar Indonesia. Setiap AI Agent yang kami bangun dirancang untuk
            berbicara dengan natural dan memberikan dampak bisnis terukur.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Target,
              title: "Misi",
              desc: "Mendemokratisasi AI Agent agar terjangkau bisnis dari skala apapun.",
            },
            {
              icon: Eye,
              title: "Visi",
              desc: "Menjadi platform AI Agent pilihan utama bisnis di Indonesia.",
            },
            {
              icon: Heart,
              title: "Nilai",
              desc: "Sederhana, jujur, dan fokus pada dampak nyata bagi pelanggan.",
            },
          ].map((v) => (
            <div key={v.title} className="rounded-2xl border border-border bg-card p-6 text-center">
              <v.icon className="mx-auto h-6 w-6 text-teal" />
              <h3 className="mt-3 font-display text-lg font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Button asChild size="lg">
            <Link to="/kontak">Mari berkenalan</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
