import { createFileRoute, redirect } from "@tanstack/react-router";

/** Alias: /admin/agent/:key -> /admin/agents/:key */
export const Route = createFileRoute("/admin/agent/$key")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/admin/agents/$key", params: { key: params.key } });
  },
});
