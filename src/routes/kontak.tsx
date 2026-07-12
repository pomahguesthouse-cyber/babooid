import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/kontak")({
  head: () => ({
    meta: [
      { title: "Daftar Baboo — Baboo.id" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: KontakRedirectPage,
});

function KontakRedirectPage() {
  useEffect(() => {
    window.location.replace("/daftar-baboo");
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-cream px-6 text-center text-navy">
      <div className="max-w-md rounded-[24px] border-[2.5px] border-navy bg-white p-7 shadow-[0_7px_0_rgba(11,27,46,0.18)]">
        <p className="font-display text-2xl font-extrabold">Membuka halaman pendaftaran…</p>
        <p className="mt-2 text-sm opacity-70">
          Silakan isi kebutuhan Anda agar tim Baboo dapat menghubungi Anda.
        </p>
        <a
          href="/daftar-baboo"
          className="mt-5 inline-flex rounded-full border-[3px] border-navy bg-sun px-5 py-2 font-display text-sm font-bold text-navy-deep"
        >
          Daftar Baboo
        </a>
      </div>
    </main>
  );
}