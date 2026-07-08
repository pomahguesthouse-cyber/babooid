// =============================================================
// Agent Demo — Edge Function (Supabase / Deno)
// Demo publik untuk mencoba agent aktif Baboo tanpa akses admin.
// Config dibaca dari ai_agents + ai_providers memakai service role.
// Deploy: supabase functions deploy agent-demo
// =============================================================

// @ts-expect-error — modul Deno diselesaikan saat runtime di Supabase.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: { env: { get(key: string): string | undefined } };

const ENV_ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const DEMO_AGENT_KEYS = new Set(["mandor", "civil", "cad", "architect"]);

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
type Provider = { key: string; name: string; base_url: string; api_key: string; enabled: boolean };

type AgentConfig = {
  name: string;
  system_prompt: string | null;
  model: string;
  temperature: number;
  provider: string;
  status: string;
};

async function getProvider(
  admin: ReturnType<typeof createClient>,
  key: string,
): Promise<Provider | null> {
  const { data } = await admin
    .from("ai_providers")
    .select("key, name, base_url, api_key, enabled")
    .eq("key", key)
    .single();
  return (data as Provider | null) ?? null;
}

async function callLlm(opts: {
  provider: Provider;
  model: string;
  temperature: number;
  system: string;
  messages: ChatMessage[];
}): Promise<string> {
  const { provider, model, temperature, system, messages } = opts;

  if (provider.key === "anthropic") {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": provider.api_key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, max_tokens: 1200, temperature, system, messages }),
    });
    if (!resp.ok) throw new Error(`${provider.name}: ${await resp.text()}`);
    const data = await resp.json();
    return data?.content?.[0]?.text ?? "";
  }

  const base = provider.base_url.replace(/\/$/, "");
  const resp = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.api_key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      temperature,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!resp.ok) throw new Error(`${provider.name}: ${await resp.text()}`);
  const data = await resp.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    if (!SERVICE_ROLE_KEY) {
      return json({ error: "SERVICE_ROLE_KEY belum dikonfigurasi untuk demo agent." }, 500);
    }

    const body = await req.json();
    const agentKey = typeof body.agent_key === "string" ? body.agent_key.trim() : "";
    if (!DEMO_AGENT_KEYS.has(agentKey)) {
      return json({ error: "Agent demo tidak tersedia." }, 400);
    }

    const messages: ChatMessage[] = Array.isArray(body.messages)
      ? body.messages
          .filter(
            (m: ChatMessage) =>
              (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
          )
          .map((m: ChatMessage) => ({
            role: m.role,
            content: m.content.slice(0, 2500),
          }))
          .slice(-10)
      : [];

    if (messages.length === 0) {
      return json({ error: "Pesan demo wajib diisi." }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: agent, error: agentErr } = await admin
      .from("ai_agents")
      .select("name, system_prompt, model, temperature, provider, status")
      .eq("key", agentKey)
      .eq("status", "aktif")
      .single();

    if (agentErr || !agent) {
      return json({ error: `Agent '${agentKey}' belum aktif atau tidak ditemukan.` }, 404);
    }

    const config = agent as AgentConfig;
    let provider = await getProvider(admin, config.provider || "anthropic");
    if (!provider) {
      provider = {
        key: "anthropic",
        name: "Anthropic",
        base_url: "https://api.anthropic.com",
        api_key: ENV_ANTHROPIC_KEY,
        enabled: true,
      };
    }

    if (provider.key === "anthropic" && !provider.api_key) provider.api_key = ENV_ANTHROPIC_KEY;
    if (!provider.enabled) return json({ error: `Provider ${provider.name} belum aktif.` }, 500);
    if (!provider.api_key) return json({ error: `API key ${provider.name} belum diisi.` }, 500);
    if (provider.key === "custom" && !provider.base_url) {
      return json({ error: "Base URL custom endpoint belum diisi di Settings." }, 500);
    }

    const systemPrompt =
      (config.system_prompt?.trim() ||
        `Kamu adalah ${config.name}, asisten AI di platform Baboo.id.`) +
      "\nKonteks: ini adalah demo publik Baboo.id. Jawab dalam Bahasa Indonesia, ringkas, membantu, dan profesional. Jangan meminta data sensitif. Bila user butuh eksekusi tool nyata, arahkan ke dashboard atau konsultasi lanjutan.";

    const reply = await callLlm({
      provider,
      model: config.model || "claude-sonnet-4-6",
      temperature: typeof config.temperature === "number" ? config.temperature : 0.5,
      system: systemPrompt,
      messages,
    });

    return json({
      message: reply,
      model: config.model,
      provider: provider.key,
      agent_name: config.name,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Kesalahan tak terduga." }, 500);
  }
});
