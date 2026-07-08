import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/kontak")({
  head: () => ({
    meta: [
      { title: "Demo Agent Baboo — Baboo.id" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: KontakRedirectPage,
});

function KontakRedirectPage() {
  useEffect(() => {
    window.location.replace("/demo");
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-cream px-6 text-center text-navy">
      <div className="max-w-md rounded-[24px] border-[2.5px] border-navy bg-white p-7 shadow-[0_7px_0_rgba(11,27,46,0.18)]">
        <p className="font-display text-2xl font-extrabold">Pindah ke halaman demo…</p>
        <p className="mt-2 text-sm opacity-70">
          Halaman kontak sekarang diarahkan ke Demo Agent Baboo.
        </p>
        <a
          href="/demo"
          className="mt-5 inline-flex rounded-full border-[3px] border-navy bg-sun px-5 py-2 font-display text-sm font-bold text-navy-deep"
        >
          Buka Demo Agent
        </a>
      </div>
    </main>
  );
}
