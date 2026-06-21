import { Link } from "@tanstack/react-router";

const footerLinks = [
  { href: "#agent", label: "Agent" },
  { href: "#process", label: "Process" },
  { href: "#platform", label: "Platform" },
  { href: "#usecase", label: "Use Case" },
  { href: "/kontak", label: "Contact", isRoute: true },
];

export const SiteFooter = () => {
  return (
    <footer className="border-t border-white/[0.06] bg-[#06131F]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center gap-2.5 md:justify-start">
              <img
                src="/img/logo_transparan.png"
                alt="Baboo AI Agent"
                className="h-8 w-8 object-contain"
              />
              <span className="font-display text-base font-bold text-white">
                Baboo AI Agent
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-[#94A3B8]">
              Bibi siap bantu beresin kerjaan digital.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm text-[#94A3B8] transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-[#94A3B8] transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-white/[0.06] pt-6 text-center">
          <p className="text-xs text-[#64748B]">
            © {new Date().getFullYear()} Baboo AI Agent. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
