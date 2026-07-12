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
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

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
type DemoAttachment = {
  name: string;
  mimeType: string;
  size: number;
  data: string;
};
type Provider = { key: string; name: string; base_url: string; api_key: string; enabled: boolean };

type AgentConfig = {
  name: string;
  system_prompt: string | null;
  model: string;
  temperature: number;
  provider: string;
  status: string;
};

function decodedBase64Size(data: string) {
  const padding = data.endsWith("==") ? 2 : data.endsWith("=") ? 1 : 0;
  return Math.floor((data.length * 3) / 4) - padding;
}

function parseAttachment(value: unknown): DemoAttachment | null {
  if (value == null) return null;
  if (typeof value !== "object") throw new Error("Format lampiran tidak valid.");

  const input = value as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const mimeType = typeof input.mime_type === "string" ? input.mime_type.trim().toLowerCase() : "";
  const declaredSize = typeof input.size === "number" ? input.size : 0;
  const data = typeof input.data === "string" ? input.data.replace(/\s/g, "") : "";

  if (!name || name.length > 160) throw new Error("Nama file tidak valid.");
  if (!ALLOWED_ATTACHMENT_TYPES.has(mimeType)) {
    throw new Error("Format file belum didukung. Gunakan JPG, PNG, WEBP, atau PDF.");
  }
  if (!data || !/^[A-Za-z0-9+/]*={0,2}$/.test(data)) {
    throw new Error("Isi lampiran tidak valid.");
  }

  const actualSize = decodedBase64Size(data);
  if (actualSize <= 0 || declaredSize <= 0) throw new Error("Lampiran kosong.");
  if (actualSize > MAX_ATTACHMENT_SIZE || declaredSize > MAX_ATTACHMENT_SIZE) {
    throw new Error("Ukuran file maksimal 5 MB.");
  }

  return { name, mimeType, size: actualSize, data };
}

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

function attachToAnthropicMessages(messages: ChatMessage[], attachment: DemoAttachment | null) {
  if (!attachment) return messages;

  let lastUserIndex = -1;
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === "user") {
      lastUserIndex = index;
      break;
    }
  }

  return messages.map((message, index) => {
    if (index !== lastUserIndex) return message;

    const fileBlock =
      attachment.mimeType === "application/pdf"
        ? {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: attachment.data,
            },
          }
        : {
            type: "image",
            source: {
              type: "base64",
              media_type: attachment.mimeType,
              data: attachment.data,
            },
          };

    return {
      role: message.role,
      content: [fileBlock, { type: "text", text: message.content }],
    };
  });
}

function attachToOpenAiMessages(messages: ChatMessage[], attachment: DemoAttachment | null) {
  if (!attachment) return messages;
  if (attachment.mimeType === "application/pdf") {
    throw new Error(
      "Model aktif memakai endpoint chat yang belum mendukung PDF. Gunakan provider Anthropic atau unggah halaman PDF sebagai gambar.",
    );
  }

  let lastUserIndex = -1;
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === "user") {
      lastUserIndex = index;
      break;
    }
  }

  return messages.map((message, index) => {
    if (index !== lastUserIndex) return message;
    return {
      role: message.role,
      content: [
        { type: "text", text: message.content },
        {
          type: "image_url",
          image_url: { url: `data:${attachment.mimeType};base64,${attachment.data}` },
        },
      ],
    };
  });
}

async function callLlm(opts: {
  provider: Provider;
  model: string;
  temperature: number;
  system: string;
  messages: ChatMessage[];
  attachment: DemoAttachment | null;
}): Promise<string> {
  const { provider, model, temperature, system, messages, attachment } = opts;

  if (provider.key === "anthropic") {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": provider.api_key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1200,
        temperature,
        system,
        messages: attachToAnthropicMessages(messages, attachment),
      }),
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
      messages: [
        { role: "system", content: system },
        ...attachToOpenAiMessages(messages, attachment),
      ],
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

    const attachment = parseAttachment(body.attachment);
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
      "\nKonteks: ini adalah demo publik Baboo.id. Jawab dalam Bahasa Indonesia, ringkas, membantu, dan profesional. Jangan meminta data sensitif. Bila ada gambar atau dokumen terlampir, analisis hanya informasi yang benar-benar terlihat atau terbaca dan jelaskan bila ada bagian yang tidak jelas. Bila user butuh eksekusi tool nyata, arahkan ke dashboard atau konsultasi lanjutan.";

    const reply = await callLlm({
      provider,
      model: config.model || "claude-sonnet-4-6",
      temperature: typeof config.temperature === "number" ? config.temperature : 0.5,
      system: systemPrompt,
      messages,
      attachment,
    });

    return json({
      message: reply,
      model: config.model,
      provider: provider.key,
      agent_name: config.name,
      attachment: attachment ? { name: attachment.name, mime_type: attachment.mimeType } : null,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Kesalahan tak terduga." }, 500);
  }
});
