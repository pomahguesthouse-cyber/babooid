import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2, Ruler } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/baboo-cad")({
  head: () => ({
    meta: [
      { title: "Baboo CAD — Dialihkan ke CAD Agent | Baboo.id" },
      {
        name: "description",
        content:
          "Halaman Baboo CAD sekarang menggunakan workspace CAD Agent utama untuk AutoLISP, preview 2D, validator, dan DXF export.",
      },
    ],
  }),
  component: BabooCadRedirectPage,
});

function BabooCadRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/cad-agent", replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-[720px] flex-1 items-center justify-center px-7 py-10">
        <section className="card-pop w-full p-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mint text-navy-deep">
            <Ruler className="h-7 w-7" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-extrabold text-navy">
            Mengalihkan ke CAD Agent…
          </h1>
          <p className="mt-2 text-sm opacity-70">
            Workspace Baboo CAD sekarang disatukan di CAD Agent agar fitur AutoLISP, preview 2D,
            validator, dan DXF tidak dobel-dobel kayak file revisi_final_fix_beneran.dwg.
          </p>
          <Loader2 className="mx-auto mt-5 h-6 w-6 animate-spin text-mint-deep" />
          <a
            href="/cad-agent"
            className="mt-5 inline-flex rounded-xl bg-navy px-4 py-2 text-sm font-bold text-cream transition hover:opacity-90"
          >
            Buka CAD Agent
          </a>
        </section>
      </main>
    </div>
  );
}
