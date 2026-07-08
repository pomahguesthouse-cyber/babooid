import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { AgentDashboard } from "@/components/admin/agent-dashboard";

export const Route = createFileRoute("/admin/agents/$key")({
  component: AgentPage,
});

function AgentPage() {
  const { key } = Route.useParams();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm opacity-60">
            <Link to="/admin" className="hover:underline">
              Admin
            </Link>{" "}
            / Agents / <span className="font-semibold text-navy">{key.toUpperCase()}</span>
          </p>
          <h1 className="font-display text-3xl font-extrabold text-navy">
            Dashboard Agent {key.toUpperCase()}
          </h1>
        </div>
        <Link
          to="/admin/preview/$key"
          params={{ key }}
          className="inline-flex items-center gap-2 rounded-full border-2 border-navy/20 bg-white px-4 py-2 text-sm font-bold text-navy transition hover:-translate-y-0.5"
        >
          <Eye className="h-4 w-4" /> Preview Agent
        </Link>
      </div>

      <AgentDashboard agentKey={key} />
    </div>
  );
}
