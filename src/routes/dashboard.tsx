import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
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
  if (href === "/dashboard") return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AgentCard({ agentKey }: { agentKey: keyof typeof AGENTS }) {
  const a = AGENTS[agentKey];
  const Icon = a.icon;
  const href = AGENT_LINKS[agentKey];
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const active = Boolean(href && isAgentActive(pathname, href));
  const className = `group flex items-start gap-3 rounded-2xl border-2 p-3 text-left transition ${
    active
      ? "border-mint-deep bg-mint/15 shadow-[0_4px_0_rgba(15,110,86,0.18)]"
      : "border-navy/15 bg-cream hover:-translate-y-0.5 hover:border-mint-deep hover:bg-mint/10"
  }`;

  const content = (
    <>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${a.accent}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-sm font-bold leading-tight text-navy">{a.name}</p>
        <p className="text-xs opacity-70">{a.role}</p>
      </div>
    </>
  );

  if (!href) return <div className={className}>{content}</div>;

  return (
    <a href={href} className={className} aria-current={active ? "page" : undefined}>
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
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="mx-auto grid w-full max-w-[1180px] flex-1 gap-8 px-7 py-10 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <div className="card-pop p-5">
              <p className="eyebrow text-mint-deep">Tim Baboo</p>
              <div className="mt-4 space-y-3">
                <AgentCard agentKey="mandor" />
                <div className="pl-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-50">
                    Sub-agent
                  </p>
                  <div className="space-y-2">
                    {SUB_AGENTS.map((a) => (
                      <AgentCard key={a.key} agentKey={a.key} />
                    ))}
                  </div>
                </div>
              </div>
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
                  <p className="font-display text-sm font-bold text-navy">AI Lab</p>
                  <p className="text-xs opacity-70">Backend — ai.baboo.id</p>
                </div>
              </a>
            ) : null}
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
