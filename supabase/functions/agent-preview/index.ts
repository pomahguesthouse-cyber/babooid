// =============================================================
// Agent Preview — Edge Function (Supabase / Deno)
// Chat generik untuk menguji agent apa pun dari AI Lab.
// Multi-provider: Anthropic (format asli) + OpenAI-compatible
// (Google AI Studio, OpenRouter, OpenAI, custom endpoint).
// Config dibaca dari ai_agents + ai_providers. Hanya untuk admin.
// Deploy: supabase functions deploy agent-preview
// =============================================================

// @ts-expect-error — modul Deno diselesaikan saat runtime di Supabase.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: { env: { get(key: string): string | undefined } };

const ENV_ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

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

/** Panggil LLM sesuai provider; kembalikan teks jawaban. */
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
      body: JSON.stringify({ model, max_tokens: 4000, temperature, system, messages }),
    });
    if (!resp.ok) throw new Error(`${provider.name}: ${await resp.text()}`);
    const data = await resp.json();
    return data?.content?.[0]?.text ?? "";
  }

  // OpenAI-compatible (Google AI Studio, OpenRouter, OpenAI, custom)
  const base = provider.base_url.replace(/\/$/, "");
  const resp = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.api_key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
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
    // Override opsional dari pemilih model di halaman preview
    const providerOverride: string =
      typeof body.provider_override === "string" ? body.provider_override.trim() : "";
    const modelOverride: string =
      typeof body.model_override === "string" ? body.model_override.trim() : "";

    // --- Config agent + provider ---
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);
    const { data: agent, error: agentErr } = await admin
      .from("ai_agents")
      .select("name, system_prompt, model, temperature, provider")
      .eq("key", agentKey)
      .single();
    if (agentErr || !agent) return json({ error: `Agent '${agentKey}' tidak ditemukan.` }, 404);

    const providerKey = providerOverride || (agent.provider as string) || "anthropic";
    let provider = await getProvider(admin, providerKey);
    if (!provider) {
      // Fallback lama: tabel ai_providers belum ada → anggap Anthropic dari env
      provider = {
        key: "anthropic",
        name: "Anthropic",
        base_url: "https://api.anthropic.com",
        api_key: ENV_ANTHROPIC_KEY,
        enabled: true,
      };
    }
    if (provider.key === "anthropic" && !provider.api_key) provider.api_key = ENV_ANTHROPIC_KEY;
    if (!provider.api_key) {
      return json(
        { error: `API key ${provider.name} belum diisi. Buka Settings → tab ${provider.name}.` },
        500,
      );
    }
    if (provider.key === "custom" && !provider.base_url) {
      return json({ error: "Base URL custom endpoint belum diisi di Settings." }, 500);
    }

    const systemPrompt =
      (agent.system_prompt?.trim() ||
        `Kamu adalah ${agent.name}, asisten AI di platform Baboo.id.`) +
      "\nJawab dalam Bahasa Indonesia, ringkas dan membantu.";

    const reply = await callLlm({
      provider,
      model: modelOverride || agent.model || "claude-sonnet-4-6",
      temperature: typeof agent.temperature === "number" ? agent.temperature : 0.5,
      system: systemPrompt,
      messages,
    });

    return json({ message: reply, model: agent.model, provider: provider.key });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Kesalahan tak terduga." }, 500);
  }
});
