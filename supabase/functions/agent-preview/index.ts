// =============================================================
// Agent Preview — Edge Function (Supabase / Deno)
// Chat generik untuk menguji agent apa pun dari AI Lab.
// Config (system prompt, model, temperature) dibaca dari ai_agents.
// Hanya untuk admin (cek via public.is_admin()).
//
// Secret yang dibutuhkan:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// Deploy:
//   supabase functions deploy agent-preview
// =============================================================

// @ts-expect-error — modul Deno diselesaikan saat runtime di Supabase.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: { env: { get(key: string): string | undefined } };

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const FALLBACK_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type ChatMessage = { role: "user" | "assistant"; content: string };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    if (!ANTHROPIC_API_KEY) {
      return json({ error: "ANTHROPIC_API_KEY belum diset di secrets." }, 500);
    }

    // --- Auth: wajib login & admin ---
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Tidak terautentikasi." }, 401);

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Sesi tidak valid." }, 401);

    const { data: isAdmin } = await userClient.rpc("is_admin");
    if (!isAdmin) return json({ error: "Hanya admin yang boleh memakai preview." }, 403);

    // --- Input ---
    const body = await req.json();
    const agentKey: string = typeof body.agent_key === "string" ? body.agent_key : "";
    const messages: ChatMessage[] = Array.isArray(body.messages)
      ? body.messages
          .filter(
            (m: ChatMessage) =>
              (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
          )
          .slice(-20)
      : [];
    if (!agentKey || messages.length === 0) {
      return json({ error: "agent_key dan messages wajib diisi." }, 400);
    }

    // --- Config agent dari AI Lab ---
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);
    const { data: agent, error: agentErr } = await admin
      .from("ai_agents")
      .select("name, system_prompt, model, temperature, status")
      .eq("key", agentKey)
      .single();
    if (agentErr || !agent) return json({ error: `Agent '${agentKey}' tidak ditemukan.` }, 404);

    const systemPrompt =
      (agent.system_prompt?.trim() ||
        `Kamu adalah ${agent.name}, asisten AI di platform Baboo.id.`) +
      "\nJawab dalam Bahasa Indonesia, ringkas dan membantu.";

    // --- Panggil Anthropic ---
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: agent.model || FALLBACK_MODEL,
        max_tokens: 4000,
        temperature: typeof agent.temperature === "number" ? agent.temperature : 0.5,
        system: systemPrompt,
        messages,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return json({ error: `LLM error: ${errText}` }, 502);
    }

    const data = await resp.json();
    const reply: string = data?.content?.[0]?.text ?? "";
    return json({ message: reply, model: agent.model });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Kesalahan tak terduga." }, 500);
  }
});
