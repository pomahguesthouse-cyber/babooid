import { createFileRoute } from "@tanstack/react-router";
import { Clock, Wallet, Plug, Settings, Globe, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/page-hero";

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
  { icon: Clock, bg: "#E1F5EE", stroke: "#0F6E56", title: "Respons 24/7", desc: "Pelanggan terlayani kapan saja, termasuk akhir pekan dan hari libur." },
  { icon: Wallet, bg: "#FAEEDA", stroke: "#8A5A00", title: "Hemat biaya operasional", desc: "Kurangi beban kerja tim, alokasikan SDM untuk hal yang lebih strategis." },
  { icon: Plug, bg: "#FAECE7", stroke: "#A63D14", title: "Mudah diintegrasikan", desc: "Terhubung dengan WhatsApp, website, CRM, dan tools yang sudah Anda pakai." },
  { icon: Settings, bg: "#EEEDFE", stroke: "#3C3489", title: "Bisa dikustomisasi", desc: "AI Agent disesuaikan dengan brand, produk, dan alur kerja perusahaan." },
  { icon: Globe, bg: "#E1F5EE", stroke: "#0F6E56", title: "Bahasa Indonesia natural", desc: "Memahami konteks lokal dan gaya percakapan pelanggan Indonesia." },
  { icon: ShieldCheck, bg: "#FAEEDA", stroke: "#8A5A00", title: "Aman & terkendali", desc: "Anda tetap punya kendali penuh atas data dan respons AI." },
];

function AdvantagesPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Keunggulan"
        title="Kenapa pilih Baboo.id"
        desc="Dirancang untuk memberi dampak bisnis nyata sejak hari pertama."
      />

      <section className="mx-auto max-w-[1180px] px-7 py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div key={i.title} className="card-pop card-pop-hover p-6">
              <div className="grid h-[54px] w-[54px] place-items-center rounded-2xl" style={{ background: i.bg }}>
                <i.icon className="h-6 w-6" style={{ color: i.stroke }} />
              </div>
              <h3 className="mt-5 font-display text-lg font-extrabold">{i.title}</h3>
              <p className="mt-2 text-[14.5px] opacity-85">{i.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
