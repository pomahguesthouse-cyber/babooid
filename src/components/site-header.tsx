import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";

const navLinks = [
  { to: "/", label: "Beranda" },
  { to: "/layanan", label: "Layanan" },
  { to: "/daftar-baboo", label: "Daftar Baboo" },
  { to: "/cara-kerja", label: "Cara kerja" },
  { to: "/keunggulan", label: "Keunggulan" },
  { to: "/harga", label: "Harga" },
  { to: "/tentang", label: "Tentang" },
] as const;

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b-[2.5px] border-navy bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-7 py-4">
        <Link to="/" className="flex items-center" aria-label="Baboo.id">
          <span className="flex h-12 items-center rounded-full bg-navy px-4 py-2 shadow-[0_5px_0_rgba(11,27,46,0.18)]">
            <img
              src="/img/logo_trans.png"
              alt="Baboo.id"
              className="h-8 w-auto max-w-[150px] object-contain sm:max-w-[190px]"
            />
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-[15px] font-semibold text-navy lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group relative py-1"
              activeOptions={{ exact: link.to === "/" }}
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-[3px] rounded bg-mint transition-all duration-200 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </>
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-full border-[3px] border-navy bg-transparent px-5 py-2 font-display text-sm font-bold text-navy transition hover:bg-navy hover:text-cream"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-full border-[3px] border-navy bg-sun px-5 py-2 font-display text-sm font-bold text-navy-deep shadow-[0_6px_0_rgba(11,27,46,0.25)] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_rgba(11,27,46,0.25)]"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                to="/masuk"
                className="rounded-full border-[3px] border-navy bg-transparent px-5 py-2 font-display text-sm font-bold text-navy transition hover:bg-navy hover:text-cream"
              >
                Masuk
              </Link>
              <Link
                to="/kontak"
                className="rounded-full border-[3px] border-navy bg-sun px-5 py-2 font-display text-sm font-bold text-navy-deep shadow-[0_6px_0_rgba(11,27,46,0.25)] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_rgba(11,27,46,0.25)]"
              >
                Demo Agent
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full border-[2.5px] border-navy text-navy lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t-[2.5px] border-navy bg-cream lg:hidden">
          <nav className="mx-auto flex max-w-[1180px] flex-col gap-1 px-7 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 font-display text-base font-bold text-navy hover:bg-cream-deep"
                activeProps={{ className: "bg-cream-deep" }}
                activeOptions={{ exact: link.to === "/" }}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-full border-[3px] border-navy bg-transparent px-5 py-2.5 text-center font-display font-bold text-navy"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void signOut();
                  }}
                  className="mt-1 rounded-full border-[3px] border-navy bg-transparent px-5 py-2.5 text-center font-display font-bold text-navy"
                >
                  Keluar
                </button>
              </>
            ) : (
              <Link
                to="/masuk"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full border-[3px] border-navy bg-transparent px-5 py-2.5 text-center font-display font-bold text-navy"
              >
                Masuk
              </Link>
            )}
            <Link
              to="/kontak"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-full border-[3px] border-navy bg-sun px-5 py-2.5 text-center font-display font-bold text-navy-deep"
            >
              Demo Agent
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
