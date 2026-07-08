import { Link } from "@tanstack/react-router";
import { BabooLogo } from "./bibi-mascot";

export const SiteFooter = () => {
  return (
    <footer className="bg-navy-deep text-cream/85">
      <div className="mx-auto max-w-[1180px] px-7 pb-8 pt-14">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-3 flex items-center gap-2.5 font-display text-[22px] font-extrabold text-cream">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-navy">
                <BabooLogo />
              </span>
              Baboo<span className="text-mint">.id</span>
            </div>
            <p className="max-w-[260px] text-[13.5px] opacity-75">
              AI Agent yang membantu bisnis Indonesia melayani pelanggan, 24 jam tanpa henti.
            </p>
          </div>

          <div>
            <h5 className="mb-3 font-display text-[15px] text-cream">Produk</h5>
            <ul className="space-y-2 text-sm opacity-75">
              <li>
                <Link to="/layanan" className="hover:text-mint">
                  AI Customer Service
                </Link>
              </li>
              <li>
                <Link to="/layanan" className="hover:text-mint">
                  AI Sales Agent
                </Link>
              </li>
              <li>
                <Link to="/layanan" className="hover:text-mint">
                  AI Booking Agent
                </Link>
              </li>
              <li>
                <Link to="/layanan" className="hover:text-mint">
                  AI Agent Kustom
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-3 font-display text-[15px] text-cream">Perusahaan</h5>
            <ul className="space-y-2 text-sm opacity-75">
              <li>
                <Link to="/tentang" className="hover:text-mint">
                  Tentang kami
                </Link>
              </li>
              <li>
                <Link to="/studi-kasus" className="hover:text-mint">
                  Cerita pengguna
                </Link>
              </li>
              <li>
                <Link to="/harga" className="hover:text-mint">
                  Harga
                </Link>
              </li>
              <li>
                <Link to="/demo" className="hover:text-mint">
                  Demo Agent
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-3 font-display text-[15px] text-cream">Hubungi</h5>
            <ul className="space-y-2 text-sm opacity-75">
              <li>halo@baboo.id</li>
              <li>WhatsApp: 0812-3456-7890</li>
              <li>Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-cream/15 pt-5 text-[13px] opacity-60">
          <span>© {new Date().getFullYear()} Baboo.id — Semua hak dilindungi.</span>
          <span>Dibuat dengan secangkir kopi dan banyak kemoceng AI ✦</span>
        </div>
      </div>
    </footer>
  );
};
