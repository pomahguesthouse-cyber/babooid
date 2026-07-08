import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bot, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AiLabPanel } from "@/components/ai-lab-panel";
import { useAiAgents, type AiAgent } from "@/lib/ai-lab";

export const Route = createFileRoute("/admin/")({
  component: AdminIndex,
});

const statusBadge: Record<AiAgent["status"], string> = {
  draft: "bg-navy/10 text-navy",
  aktif: "bg-mint/25 text-mint-deep",
  nonaktif: "bg-coral/25 text-coral-deep",
};

function AdminIndex() {
  const { data: agents, isLoading } = useAiAgents();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm opacity-60">Admin</p>
        <h1 className="font-display text-3xl font-extrabold text-navy">Dashboard</h1>
      </div>

      {/* Kartu agent — klik untuk buka dashboard agent */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-mint-deep" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(agents ?? []).map((a) => (
            <Link
              key={a.id}
              to="/admin/agents/$key"
              params={{ key: a.key }}
              className="group rounded-2xl border-2 border-navy/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-mint-deep"
            >
              <div className="flex items-start justify-between">
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${a.accent}`}>
                  <Bot className="h-5 w-5" />
                </span>
                <Badge className={statusBadge[a.status]}>{a.status}</Badge>
              </div>
              <p className="mt-3 font-display font-bold text-navy">{a.name}</p>
              <p className="text-xs opacity-60">{a.role}</p>
              <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-mint-deep opacity-0 transition group-hover:opacity-100">
                Buka dashboard <ArrowRight className="h-3 w-3" />
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Panel lama (kelola agent, training, tools, knowledge) */}
      <AiLabPanel />
    </div>
  );
}
