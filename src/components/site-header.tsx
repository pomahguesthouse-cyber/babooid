import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#agent", label: "Agent" },
  { href: "#process", label: "Process" },
  { href: "#platform", label: "Platform" },
  { href: "#usecase", label: "Use Case" },
  { href: "#faq", label: "FAQ" },
] as const;

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#06131F]/80 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/img/logo_transparan.png"
            alt="Baboo AI Agent"
            className="h-10 w-10 object-contain"
          />
          <span className="font-display text-lg font-bold tracking-tight text-white">
            Baboo<span className="text-cyan">.</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-[#94A3B8] transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <Link
            to="/kontak"
            className="inline-flex items-center justify-center rounded-lg bg-cyan px-5 py-2.5 text-[13px] font-semibold text-[#06131F] transition-all hover:bg-teal-glow hover:shadow-cyan"
          >
            Coba Baboo
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/[0.06] bg-[#06131F]/95 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#94A3B8] hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/kontak"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-cyan px-5 py-2.5 text-sm font-semibold text-[#06131F] hover:bg-teal-glow"
            >
              Coba Baboo
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
