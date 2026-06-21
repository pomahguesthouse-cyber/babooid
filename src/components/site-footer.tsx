import { Link } from "@tanstack/react-router";
import { Sparkles, Mail, Phone, Instagram, Linkedin } from "lucide-react";

export const SiteFooter = () => {
  return (
    <footer className="border-t border-border bg-navy-deep text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">
              <Sparkles className="h-4 w-4 text-teal" />
            </span>
            Baboo<span className="text-teal">.id</span>
          </div>
          <p className="max-w-xs text-sm text-white/60">
            Membantu bisnis di Indonesia tumbuh lebih cepat dengan AI Agent yang siap kerja 24/7.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-display text-sm font-semibold text-white">Perusahaan</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link to="/tentang" className="hover:text-teal">Tentang kami</Link></li>
            <li><Link to="/layanan" className="hover:text-teal">Layanan</Link></li>
            <li><Link to="/harga" className="hover:text-teal">Harga</Link></li>
            <li><Link to="/studi-kasus" className="hover:text-teal">Studi kasus</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-display text-sm font-semibold text-white">Hubungi kami</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-teal" /> halo@baboo.id</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-teal" /> +62 812 0000 0000</li>
          </ul>
          <div className="mt-4 flex gap-3">
            <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-md bg-white/5 hover:bg-white/10">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="LinkedIn" className="grid h-9 w-9 place-items-center rounded-md bg-white/5 hover:bg-white/10">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-display text-sm font-semibold text-white">Siap mulai?</h4>
          <p className="mb-3 text-sm text-white/60">
            Jadwalkan konsultasi gratis 30 menit dengan tim kami.
          </p>
          <Link
            to="/kontak"
            className="inline-flex items-center justify-center rounded-md bg-teal px-4 py-2 text-sm font-semibold text-navy-deep hover:bg-teal-glow"
          >
            Konsultasi gratis
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Baboo.id — Semua hak dilindungi.
      </div>
    </footer>
  );
};
