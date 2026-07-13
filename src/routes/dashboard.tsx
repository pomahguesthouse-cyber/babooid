import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { FlaskConical, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { AGENTS, SUB_AGENTS } from "@/lib/agents";
import { useIsAdmin } from "@/lib/ai-lab";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Baboo.id" }],
  }),
  component: DashboardLayout,
});

const AGENT_LINKS: Partial<Record<keyof typeof AGENTS, string>> = {
  mandor: "/dashboard",
  civil: "/baboo-civil",
  cad: "/cad-agent",
};

function isAgentActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AgentCard({
  agentKey,
  compact = false,
}: {
  agentKey: keyof typeof AGENTS;
  compact?: boolean;
}) {
  const agent = AGENTS[agentKey];
  const Icon = agent.icon;
  const href = AGENT_LINKS[agentKey];
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const active = Boolean(href && isAgentActive(pathname, href));
  const className = `group flex items-center gap-3 rounded-2xl border-2 text-left transition ${
    compact ? "min-w-[190px] px-3 py-2.5" : "p-3"
  } ${
    active
      ? "border-mint-deep bg-mint/15 shadow-[0_4px_0_rgba(15,110,86,0.18)]"
      : "border-navy/15 bg-cream hover:-translate-y-0.5 hover:border-mint-deep hover:bg-mint/10"
  }`;

  const content = (
    <>
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${agent.accent}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-bold leading-tight text-navy">
          {agent.name}
        </p>
        <p className="truncate text-xs opacity-65">{agent.role}</p>
      </div>
    </>
  );

  if (!href) return <div className={className}>{content}</div>;

  return (
    <a
      href={href}
      className={className}
      aria-current={active ? "page" : undefined}
    >
      {content}
    </a>
  );
}

function DashboardLayout() {
  const { user, loading } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/masuk" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-deep">
        <Loader2 className="h-8 w-8 animate-spin text-mint-deep" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream-deep/35">
      <SiteHeader />
      <div className="mx-auto grid w-full max-w-[1240px] flex-1 gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8 lg:px-7 lg:py-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-5">
            <div className="card-pop p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow text-mint-deep">Workspace</p>
                  <h2 className="mt-1 font-display text-lg font-extrabold text-navy">
                    Tim Baboo
                  </h2>
                </div>
                <span className="rounded-full border-2 border-mint-deep/25 bg-mint/15 px-2.5 py-1 text-[11px] font-bold text-mint-deep">
                  Online
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <AgentCard agentKey="mandor" />
                <div className="pl-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/45">
                    Spesialis
                  </p>
                  <div className="space-y-2">
                    {SUB_AGENTS.map((agent) => (
                      <AgentCard key={agent.key} agentKey={agent.key} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-navy/15 bg-navy px-4 py-4 text-cream shadow-[0_5px_0_rgba(19,41,75,0.15)]">
              <p className="font-display text-sm font-extrabold">Tip cepat</p>
              <p className="mt-1 text-xs leading-relaxed text-cream/70">
                Buat satu proyek untuk setiap pekerjaan agar file dan percakapan
                tetap terorganisasi.
              </p>
            </div>

            {isAdmin ? (
              <a
                href="https://ai.baboo.id/admin"
                className="card-pop flex items-center gap-3 p-4 transition hover:-translate-y-0.5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy text-cream">
                  <FlaskConical className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-navy">
                    AI Lab
                  </p>
                  <p className="text-xs opacity-65">Backend — ai.baboo.id</p>
                </div>
              </a>
            ) : null}
          </div>
        </aside>

        <main className="min-w-0">
          <section className="mb-5 lg:hidden" aria-label="Tim Baboo">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="eyebrow text-mint-deep">Tim Baboo</p>
                <p className="mt-0.5 text-xs text-navy/60">
                  Pilih agen sesuai kebutuhan
                </p>
              </div>
              <span className="rounded-full border border-mint-deep/25 bg-mint/15 px-2.5 py-1 text-[11px] font-bold text-mint-deep">
                Online
              </span>
            </div>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
              <AgentCard agentKey="mandor" compact />
              {SUB_AGENTS.map((agent) => (
                <AgentCard key={agent.key} agentKey={agent.key} compact />
              ))}
            </div>
          </section>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
