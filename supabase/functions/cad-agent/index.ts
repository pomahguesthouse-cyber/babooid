// =============================================================
// CAD Agent — Edge Function (Supabase / Deno)
// Menerima gambar (sketsa/denah/foto gambar teknik) + instruksi,
// lalu menghasilkan script AutoLISP untuk AutoCAD beserta daftar
// geometri (entities) untuk preview 2D di browser.
//
// Secret yang dibutuhkan:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// Deploy:
//   supabase functions deploy cad-agent
// =============================================================

// @ts-expect-error — modul Deno diselesaikan saat runtime di Supabase.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Deno global tersedia di runtime Supabase Edge Functions.
declare const Deno: { env: { get(key: string): string | undefined } };

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";

// Konfigurasi agent dibaca dari AI Lab (tabel ai_agents, key='cad').
// Di-cache sebentar agar tidak query tiap request.
type AgentConfig = {
  system_prompt: string;
  model: string;
  temperature: number;
  provider: string;
};
let cachedConfig: { value: AgentConfig | null; at: number } = { value: null, at: 0 };
const CONFIG_TTL_MS = 60_000;

async function getAgentConfig(): Promise<AgentConfig | null> {
  if (!SERVICE_ROLE_KEY) return null;
  const now = Date.now();
  if (cachedConfig.value && now - cachedConfig.at < CONFIG_TTL_MS) return cachedConfig.value;
  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data, error } = await admin
      .from("ai_agents")
      .select("system_prompt, model, temperature, status, provider")
      .eq("key", "cad")
      .single();
    if (error || !data || data.status !== "aktif" || !data.system_prompt?.trim()) {
      cachedConfig = { value: null, at: now };
      return null;
    }
    cachedConfig = {
      value: {
        system_prompt: data.system_prompt,
        model: data.model || MODEL,
        temperature: typeof data.temperature === "number" ? data.temperature : 0.2,
        provider: (data.provider as string) || "anthropic",
      },
      at: now,
    };
    return cachedConfig.value;
  } catch {
    return cachedConfig.value;
  }
}

type Provider = { key: string; name: string; base_url: string; api_key: string };
let cachedProvider: { value: Provider | null; forKey: string; at: number } = {
  value: null,
  forKey: "",
  at: 0,
};
async function getProvider(key: string): Promise<Provider | null> {
  const now = Date.now();
  if (cachedProvider.forKey === key && now - cachedProvider.at < 60_000) {
    return cachedProvider.value;
  }
  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);
    const { data } = await admin
      .from("ai_providers")
      .select("key, name, base_url, api_key")
      .eq("key", key)
      .single();
    cachedProvider = { value: (data as Provider | null) ?? null, forKey: key, at: now };
  } catch {
    cachedProvider = { value: null, forKey: key, at: now };
  }
  return cachedProvider.value;
}

/** API key: prioritas tabel ai_settings, fallback env secret. Cache 60 detik. */
let cachedApiKey: { value: string; at: number } = { value: "", at: 0 };
async function getApiKey(): Promise<string> {
  const now = Date.now();
  if (cachedApiKey.value && now - cachedApiKey.at < 60_000) return cachedApiKey.value;
  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);
    const { data } = await admin
      .from("ai_settings")
      .select("value")
      .eq("key", "anthropic_api_key")
      .single();
    const fromDb = (data?.value as string | undefined)?.trim();
    cachedApiKey = { value: fromDb || ANTHROPIC_API_KEY || "", at: now };
  } catch {
    cachedApiKey = { value: ANTHROPIC_API_KEY || "", at: now };
  }
  return cachedApiKey.value;
}

// Kontrak output — selalu ditambahkan, apa pun prompt dari AI Lab,
// agar parsing JSON di bawah tetap bekerja.
const OUTPUT_CONTRACT = [
  "",
  "Selain LISP, keluarkan juga daftar 'entities' — geometri yang SAMA dengan yang",
  "digambar LISP — untuk preview 2D. Tipe yang didukung:",
  '- {"type":"line","p1":[x,y],"p2":[x,y]}',
  '- {"type":"circle","center":[x,y],"r":10}',
  '- {"type":"arc","center":[x,y],"r":10,"start":0,"end":90}  (derajat, CCW)',
  '- {"type":"polyline","points":[[x,y],...],"closed":true}',
  '- {"type":"text","at":[x,y],"h":250,"value":"RUANG TAMU"}',
  'Opsional per entity: "layer":"NAMA".',
  "",
  "WAJIB balas HANYA dengan JSON valid tanpa teks lain, bentuk:",
  '{"message":"penjelasan & asumsi","lisp":"(defun c:GAMBAR ...)","entities":[...]}',
].join("\n");

const ALLOWED_MEDIA = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // ~5MB base64

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = [
  "Kamu adalah **Baboo CAD Agent**, drafter senior AutoCAD di platform Baboo.id.",
  "Tugasmu: membaca gambar yang diunggah user (sketsa tangan, denah, foto gambar",
  "teknik, atau screenshot) dan/atau instruksi teks, lalu menerjemahkannya menjadi",
  "script AutoLISP yang bisa dijalankan di AutoCAD via APPLOAD.",
  "",
  "Aturan AutoLISP:",
  "- Bungkus dalam satu perintah: (defun c:GAMBAR ( / oldos oldcmd) ...).",
  "- Simpan & matikan OSMODE dan CMDECHO di awal, kembalikan di akhir.",
  "- Gunakan (command \"_.LINE\" ...), \"_.CIRCLE\", \"_.ARC\", \"_.PLINE\",",
  "  \"_.TEXT\", \"_.LAYER\" — perintah dengan prefix _. agar aman di semua locale.",
  "- Buat layer terpisah yang relevan (mis. DINDING, AS, DIMENSI, TEKS) dengan",
  "  warna berbeda sebelum menggambar.",
  "- Semua koordinat dalam satuan gambar (asumsikan milimeter kecuali user",
  "  menyebut lain). Estimasi dimensi dari gambar bila tidak tertulis, dan",
  "  sebutkan asumsinya di 'message'.",
  "- Akhiri defun dengan (princ), lalu tambahkan (princ \"\\nKetik GAMBAR untuk menjalankan.\") di luar defun.",
  "",
  "Selain LISP, keluarkan juga daftar 'entities' — geometri yang SAMA dengan yang",
  "digambar LISP — untuk preview 2D. Tipe yang didukung:",
  '- {"type":"line","p1":[x,y],"p2":[x,y]}',
  '- {"type":"circle","center":[x,y],"r":10}',
  '- {"type":"arc","center":[x,y],"r":10,"start":0,"end":90}  (derajat, CCW)',
  '- {"type":"polyline","points":[[x,y],...],"closed":true}',
  '- {"type":"text","at":[x,y],"h":250,"value":"RUANG TAMU"}',
  "Opsional per entity: \"layer\":\"NAMA\".",
  "",
  "Jika gambar tidak jelas atau bukan gambar teknik, jelaskan di 'message' apa",
  "yang kamu butuhkan, dan kembalikan lisp/entities kosong.",
  "Jawab dalam Bahasa Indonesia, ringkas dan praktis.",
  "",
  "WAJIB balas HANYA dengan JSON valid tanpa teks lain, bentuk:",
  '{"message":"penjelasan & asumsi","lisp":"(defun c:GAMBAR ...)","entities":[...]}',
].join("\n");

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type HistoryItem = { role: "user" | "assistant"; content: string };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Tidak terautentikasi." }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Sesi tidak valid." }, 401);

    const body = await req.json();
    const message: string = typeof body.message === "string" ? body.message : "";
    const image = body.image as { data?: string; mediaType?: string } | undefined;
    const history: HistoryItem[] = Array.isArray(body.history)
      ? body.history
          .filter(
            (h: HistoryItem) =>
              (h.role === "user" || h.role === "assistant") &&
              typeof h.content === "string",
          )
          .slice(-8)
      : [];

    if (!message && !image?.data) {
      return json({ error: "Kirim instruksi teks dan/atau gambar." }, 400);
    }
    if (image?.data) {
      if (!ALLOWED_MEDIA.includes(image.mediaType ?? "")) {
        return json({ error: "Format gambar harus PNG, JPEG, WebP, atau GIF." }, 400);
      }
      if (image.data.length > MAX_IMAGE_BYTES * 1.4) {
        return json({ error: "Gambar terlalu besar (maks ±5MB)." }, 400);
      }
    }

    // Susun konten pesan terakhir user (gambar + teks).
    const userContent: unknown[] = [];
    if (image?.data) {
      userContent.push({
        type: "image",
        source: { type: "base64", media_type: image.mediaType, data: image.data },
      });
    }
    userContent.push({
      type: "text",
      text:
        message ||
        "Terjemahkan gambar ini menjadi script AutoLISP sesuai format yang diminta.",
    });

    const messagesForLlm = [
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: userContent },
    ];

    // Ambil setting dari AI Lab; fallback ke prompt bawaan bila belum ada.
    const agentConfig = await getAgentConfig();
    const systemPrompt = agentConfig
      ? agentConfig.system_prompt + "\n" + OUTPUT_CONTRACT
      : SYSTEM_PROMPT;

    // --- Pilih provider (multi-provider) ---
    const providerKey = agentConfig?.provider ?? "anthropic";
    const prov = await getProvider(providerKey);
    let raw = "";

    if (!prov || prov.key === "anthropic") {
      const key = prov?.api_key || (await getApiKey());
      if (!key) {
        return json({ error: "API key Anthropic belum diisi. Buka Settings → tab Anthropic." }, 500);
      }
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: agentConfig?.model ?? MODEL,
          max_tokens: 8000,
          temperature: agentConfig?.temperature ?? 0.2,
          system: systemPrompt,
          messages: messagesForLlm,
        }),
      });
      if (!resp.ok) return json({ error: `LLM error: ${await resp.text()}` }, 502);
      const data = await resp.json();
      raw = data?.content?.[0]?.text ?? "";
    } else {
      if (!prov.api_key) {
        return json({ error: `API key ${prov.name} belum diisi. Buka Settings → tab ${prov.name}.` }, 500);
      }
      if (!prov.base_url) {
        return json({ error: `Base URL ${prov.name} belum diisi di Settings.` }, 500);
      }
      // Konversi pesan format Anthropic -> OpenAI-compatible (termasuk gambar)
      type Block = { type: string; source?: { media_type: string; data: string }; text?: string };
      const oaMessages = messagesForLlm.map((m) => {
        if (typeof m.content === "string") return { role: m.role, content: m.content };
        const parts = (m.content as Block[]).map((b) =>
          b.type === "image" && b.source
            ? {
                type: "image_url",
                image_url: { url: `data:${b.source.media_type};base64,${b.source.data}` },
              }
            : { type: "text", text: b.text ?? "" },
        );
        return { role: m.role, content: parts };
      });
      const resp = await fetch(`${prov.base_url.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${prov.api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: agentConfig?.model ?? MODEL,
          max_tokens: 8000,
          temperature: agentConfig?.temperature ?? 0.2,
          messages: [{ role: "system", content: systemPrompt }, ...oaMessages],
        }),
      });
      if (!resp.ok) return json({ error: `LLM error (${prov.name}): ${await resp.text()}` }, 502);
      const data = await resp.json();
      raw = data?.choices?.[0]?.message?.content ?? "";
    }

    // Parse JSON dari model secara defensif.
    let reply = raw;
    let lisp = "";
    let entities: unknown[] = [];
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : raw);
      if (typeof parsed.message === "string") reply = parsed.message;
      if (typeof parsed.lisp === "string") lisp = parsed.lisp;
      if (Array.isArray(parsed.entities)) entities = parsed.entities;
    } catch {
      // Fallback: coba ekstrak blok kode LISP dari teks mentah.
      const code = raw.match(/```(?:lisp|autolisp)?\s*([\s\S]*?)```/);
      if (code) {
        lisp = code[1].trim();
        reply = raw.replace(code[0], "").trim();
      }
    }

    return json({ message: reply, lisp, entities });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Kesalahan tak terduga." }, 500);
  }
});
