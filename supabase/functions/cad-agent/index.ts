// =============================================================
// CAD Agent — Edge Function (Supabase / Deno)
// Menerima gambar (sketsa/denah/foto gambar teknik) + instruksi,
// lalu menghasilkan script AutoLISP untuk AutoCAD beserta daftar
// geometri (entities) untuk preview 2D di browser dan ekspor DXF.
// Hasil job disimpan ke cad_jobs untuk riwayat, audit, dan dataset.
//
// Secret yang dibutuhkan:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// Deploy:
//   supabase functions deploy cad-agent
// =============================================================

// @ts-expect-error — modul Deno diselesaikan saat runtime di Supabase.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Deno global tersedia di runtime Supabase Edge Functions.
declare const Deno: {
  env: { get(key: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";
const CAD_IMAGE_BUCKET = "cad-job-images";

// Konfigurasi agent dibaca dari AI Lab (tabel ai_agents, key='cad').
// Di-cache sebentar agar tidak query tiap request.
type AgentConfig = {
  id: string;
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
      .select("id, system_prompt, model, temperature, status, provider")
      .eq("key", "cad")
      .single();
    if (error || !data || data.status !== "aktif" || !data.system_prompt?.trim()) {
      cachedConfig = { value: null, at: now };
      return null;
    }
    cachedConfig = {
      value: {
        id: data.id,
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

// ---------------- RAG CONTEXT ----------------

type RagCache = { value: string; forAgentId: string; at: number };
let cachedRag: RagCache = { value: "", forAgentId: "", at: 0 };
const RAG_TTL_MS = 60_000;

function trimBlock(text: string | null | undefined, max = 1400): string {
  const value = (text ?? "").replace(/\s+/g, " ").trim();
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

async function getRagContext(agentId: string): Promise<string> {
  if (!SERVICE_ROLE_KEY || !agentId) return "";
  const now = Date.now();
  if (cachedRag.forAgentId === agentId && now - cachedRag.at < RAG_TTL_MS) {
    return cachedRag.value;
  }

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const [knowledgeRes, sopRes, toolRes] = await Promise.all([
      admin
        .from("ai_knowledge")
        .select("title, content, tags, source_type, url")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false })
        .limit(12),
      admin
        .from("ai_sops")
        .select("title, purpose, steps, output, sort")
        .eq("agent_id", agentId)
        .order("sort", { ascending: true })
        .limit(10),
      admin
        .from("ai_agent_tools")
        .select("ai_tools(name, description, type, config, enabled)")
        .eq("agent_id", agentId),
    ]);

    const knowledgeLines = ((knowledgeRes.data ?? []) as Array<{
      title: string;
      content: string | null;
      tags?: string[];
      source_type?: string;
      url?: string | null;
    }>)
      .filter((item) => item.content?.trim())
      .map((item, i) => {
        const tags = item.tags?.length ? ` [${item.tags.join(", ")}]` : "";
        return `${i + 1}. ${item.title}${tags}: ${trimBlock(item.content)}`;
      });

    const sopLines = ((sopRes.data ?? []) as Array<{
      title: string;
      purpose: string | null;
      steps: string[] | null;
      output: string | null;
    }>).map((sop, i) => {
      const steps = Array.isArray(sop.steps) ? sop.steps.join(" → ") : "";
      return `${i + 1}. ${sop.title}: ${trimBlock(sop.purpose, 500)} | Langkah: ${trimBlock(steps, 900)} | Output: ${trimBlock(sop.output, 300)}`;
    });

    const toolLines = ((toolRes.data ?? []) as Array<{
      ai_tools?: {
        name: string;
        description: string | null;
        type: string;
        config: Record<string, unknown>;
        enabled: boolean;
      } | null;
    }>)
      .map((row) => row.ai_tools)
      .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool?.enabled))
      .map((tool, i) => `${i + 1}. ${tool.name} (${tool.type}): ${trimBlock(tool.description, 500)} | config=${JSON.stringify(tool.config)}`);

    const parts = [
      "",
      "KONTEKS RAG AKTIF DARI AI LAB BABOO:",
      "Gunakan knowledge, SOP, dan tools berikut sebagai referensi utama. Jika konflik dengan instruksi user, prioritaskan instruksi user tetapi tetap jaga standar gambar teknik.",
      knowledgeLines.length ? `\nKNOWLEDGE CAD:\n${knowledgeLines.join("\n")}` : "",
      sopLines.length ? `\nSOP CAD:\n${sopLines.join("\n")}` : "",
      toolLines.length ? `\nTOOLS CAD TERDAFTAR:\n${toolLines.join("\n")}` : "",
      "",
    ];

    cachedRag = { value: parts.filter(Boolean).join("\n"), forAgentId: agentId, at: now };
  } catch {
    cachedRag = { value: "", forAgentId: agentId, at: now };
  }
  return cachedRag.value;
}

// Kontrak output — selalu ditambahkan, apa pun prompt dari AI Lab,
// agar parsing JSON di bawah tetap bekerja.
const OUTPUT_CONTRACT = [
  "",
  "Selain LISP, keluarkan juga daftar 'entities' — geometri yang SAMA dengan yang",
  "digambar LISP — untuk preview 2D dan ekspor DXF. Tipe yang didukung:",
  '- {"type":"line","p1":[x,y],"p2":[x,y],"layer":"DINDING"}',
  '- {"type":"circle","center":[x,y],"r":10,"layer":"DINDING"}',
  '- {"type":"arc","center":[x,y],"r":10,"start":0,"end":90,"layer":"BUKAAN"}  (derajat, CCW)',
  '- {"type":"polyline","points":[[x,y],...],"closed":true,"layer":"DINDING"}',
  '- {"type":"text","at":[x,y],"h":250,"value":"RUANG TAMU","layer":"TEKS"}',
  "Gunakan layer standar: AS, DINDING, BUKAAN, DIMENSI, TEKS, ARSIR, FURNITUR.",
  "Jangan menggambar entity di layer 0.",
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
  "digambar LISP — untuk preview 2D dan ekspor DXF. Tipe yang didukung:",
  '- {"type":"line","p1":[x,y],"p2":[x,y],"layer":"DINDING"}',
  '- {"type":"circle","center":[x,y],"r":10,"layer":"DINDING"}',
  '- {"type":"arc","center":[x,y],"r":10,"start":0,"end":90,"layer":"BUKAAN"}  (derajat, CCW)',
  '- {"type":"polyline","points":[[x,y],...],"closed":true,"layer":"DINDING"}',
  '- {"type":"text","at":[x,y],"h":250,"value":"RUANG TAMU","layer":"TEKS"}',
  "Gunakan layer standar: AS, DINDING, BUKAAN, DIMENSI, TEKS, ARSIR, FURNITUR.",
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

type Entity =
  | { type: "line"; p1: [number, number]; p2: [number, number]; layer?: string }
  | { type: "circle"; center: [number, number]; r: number; layer?: string }
  | { type: "arc"; center: [number, number]; r: number; start: number; end: number; layer?: string }
  | { type: "polyline"; points: [number, number][]; closed?: boolean; layer?: string }
  | { type: "text"; at: [number, number]; h: number; value: string; layer?: string };

type ValidationResult = { entities: Entity[]; warnings: string[] };
type SupabaseClientLike = ReturnType<typeof createClient>;

const STANDARD_LAYERS = ["AS", "DINDING", "BUKAAN", "DIMENSI", "TEKS", "ARSIR", "FURNITUR"];
const LAYER_COLORS: Record<string, number> = {
  AS: 1,
  DINDING: 2,
  BUKAAN: 3,
  DIMENSI: 4,
  TEKS: 7,
  ARSIR: 8,
  FURNITUR: 6,
};
const LAYER_ALIASES: Record<string, string> = {
  WALL: "DINDING",
  WALLS: "DINDING",
  DINDINGAN: "DINDING",
  OPENING: "BUKAAN",
  OPENINGS: "BUKAAN",
  PINTU: "BUKAAN",
  JENDELA: "BUKAAN",
  TEXT: "TEKS",
  TEKS: "TEKS",
  DIMENSION: "DIMENSI",
  DIMENSIONS: "DIMENSI",
  DIM: "DIMENSI",
  CENTER: "AS",
  AXIS: "AS",
  AXES: "AS",
  HATCH: "ARSIR",
  FURNITURE: "FURNITUR",
};

function asNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Number(value.toFixed(4));
}

function asPoint(value: unknown): [number, number] | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const x = asNumber(value[0]);
  const y = asNumber(value[1]);
  return x === null || y === null ? null : [x, y];
}

function samePoint(a: [number, number], b: [number, number]): boolean {
  return Math.abs(a[0] - b[0]) < 0.0001 && Math.abs(a[1] - b[1]) < 0.0001;
}

function sanitizeLayer(value: unknown, fallback: string, warnings: string[], index: number): string {
  const raw = typeof value === "string" ? value.trim().toUpperCase().replace(/\s+/g, "_") : "";
  if (!raw || raw === "0") {
    warnings.push(`Entity #${index + 1}: layer kosong/0 diganti menjadi ${fallback}.`);
    return fallback;
  }
  const mapped = LAYER_ALIASES[raw] ?? raw;
  if (!STANDARD_LAYERS.includes(mapped)) {
    warnings.push(`Entity #${index + 1}: layer \"${raw}\" tidak standar, diganti menjadi ${fallback}.`);
    return fallback;
  }
  return mapped;
}

function validateEntities(input: unknown[]): ValidationResult {
  const warnings: string[] = [];
  const entities: Entity[] = [];

  input.forEach((raw, index) => {
    if (!raw || typeof raw !== "object") {
      warnings.push(`Entity #${index + 1}: format bukan object, dilewati.`);
      return;
    }
    const item = raw as Record<string, unknown>;
    const type = item.type;

    if (type === "line") {
      const p1 = asPoint(item.p1);
      const p2 = asPoint(item.p2);
      if (!p1 || !p2 || samePoint(p1, p2)) {
        warnings.push(`Entity #${index + 1}: line tidak valid, dilewati.`);
        return;
      }
      entities.push({ type, p1, p2, layer: sanitizeLayer(item.layer, "DINDING", warnings, index) });
      return;
    }

    if (type === "circle") {
      const center = asPoint(item.center);
      const r = asNumber(item.r);
      if (!center || r === null || r <= 0) {
        warnings.push(`Entity #${index + 1}: circle tidak valid, dilewati.`);
        return;
      }
      entities.push({ type, center, r, layer: sanitizeLayer(item.layer, "DINDING", warnings, index) });
      return;
    }

    if (type === "arc") {
      const center = asPoint(item.center);
      const r = asNumber(item.r);
      const start = asNumber(item.start);
      const end = asNumber(item.end);
      if (!center || r === null || r <= 0 || start === null || end === null || start === end) {
        warnings.push(`Entity #${index + 1}: arc tidak valid, dilewati.`);
        return;
      }
      entities.push({ type, center, r, start, end, layer: sanitizeLayer(item.layer, "BUKAAN", warnings, index) });
      return;
    }

    if (type === "polyline") {
      const points = Array.isArray(item.points)
        ? item.points.map(asPoint).filter((p): p is [number, number] => Boolean(p))
        : [];
      if (points.length < 2) {
        warnings.push(`Entity #${index + 1}: polyline kurang dari 2 titik, dilewati.`);
        return;
      }
      entities.push({
        type,
        points,
        closed: Boolean(item.closed),
        layer: sanitizeLayer(item.layer, "DINDING", warnings, index),
      });
      return;
    }

    if (type === "text") {
      const at = asPoint(item.at);
      const h = asNumber(item.h) ?? 250;
      const value = typeof item.value === "string" ? item.value.trim() : "";
      if (!at || h <= 0 || !value) {
        warnings.push(`Entity #${index + 1}: text tidak valid, dilewati.`);
        return;
      }
      entities.push({ type, at, h, value, layer: sanitizeLayer(item.layer, "TEKS", warnings, index) });
      return;
    }

    warnings.push(`Entity #${index + 1}: tipe \"${String(type)}\" belum didukung, dilewati.`);
  });

  if (input.length > 0 && entities.length === 0) {
    warnings.push("Semua entities dari model tidak valid; preview/DXF dikosongkan.");
  }
  return { entities, warnings: warnings.slice(0, 40) };
}

function dxfEscape(value: string): string {
  return value.replace(/[\r\n]+/g, " ").replace(/[{}]/g, "").slice(0, 255);
}

function dxfPair(code: number, value: string | number): string {
  return `${code}\n${value}`;
}

function generateDxf(entities: Entity[]): string {
  if (!entities.length) return "";
  const layers = Array.from(new Set([...STANDARD_LAYERS, ...entities.map((e) => e.layer ?? "DINDING")])).filter(Boolean);
  const out: string[] = [];

  out.push("0", "SECTION", "2", "HEADER", "9", "$ACADVER", "1", "AC1009", "0", "ENDSEC");
  out.push("0", "SECTION", "2", "TABLES");
  out.push("0", "TABLE", "2", "LAYER", "70", String(layers.length));
  for (const layer of layers) {
    out.push(
      "0",
      "LAYER",
      "2",
      layer,
      "70",
      "0",
      "62",
      String(LAYER_COLORS[layer] ?? 7),
      "6",
      layer === "AS" ? "CENTER" : "CONTINUOUS",
    );
  }
  out.push("0", "ENDTAB", "0", "ENDSEC");
  out.push("0", "SECTION", "2", "ENTITIES");

  for (const entity of entities) {
    const layer = entity.layer ?? "DINDING";
    if (entity.type === "line") {
      out.push(
        "0",
        "LINE",
        dxfPair(8, layer),
        dxfPair(10, entity.p1[0]),
        dxfPair(20, entity.p1[1]),
        dxfPair(30, 0),
        dxfPair(11, entity.p2[0]),
        dxfPair(21, entity.p2[1]),
        dxfPair(31, 0),
      );
    } else if (entity.type === "circle") {
      out.push(
        "0",
        "CIRCLE",
        dxfPair(8, layer),
        dxfPair(10, entity.center[0]),
        dxfPair(20, entity.center[1]),
        dxfPair(30, 0),
        dxfPair(40, entity.r),
      );
    } else if (entity.type === "arc") {
      out.push(
        "0",
        "ARC",
        dxfPair(8, layer),
        dxfPair(10, entity.center[0]),
        dxfPair(20, entity.center[1]),
        dxfPair(30, 0),
        dxfPair(40, entity.r),
        dxfPair(50, entity.start),
        dxfPair(51, entity.end),
      );
    } else if (entity.type === "polyline") {
      out.push("0", "POLYLINE", dxfPair(8, layer), dxfPair(66, 1), dxfPair(70, entity.closed ? 1 : 0));
      for (const point of entity.points) {
        out.push("0", "VERTEX", dxfPair(8, layer), dxfPair(10, point[0]), dxfPair(20, point[1]), dxfPair(30, 0));
      }
      out.push("0", "SEQEND");
    } else if (entity.type === "text") {
      out.push(
        "0",
        "TEXT",
        dxfPair(8, layer),
        dxfPair(10, entity.at[0]),
        dxfPair(20, entity.at[1]),
        dxfPair(30, 0),
        dxfPair(40, entity.h),
        dxfPair(1, dxfEscape(entity.value)),
        dxfPair(50, 0),
      );
    }
  }

  out.push("0", "ENDSEC", "0", "EOF", "");
  return out.join("\n");
}

function extensionFromMediaType(mediaType?: string): string {
  if (mediaType === "image/png") return "png";
  if (mediaType === "image/jpeg") return "jpg";
  if (mediaType === "image/webp") return "webp";
  if (mediaType === "image/gif") return "gif";
  return "bin";
}

function decodeBase64(data: string): Uint8Array {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function uploadCadJobImage(
  admin: SupabaseClientLike,
  userId: string,
  jobId: string,
  image?: { data?: string; mediaType?: string },
): Promise<string | null> {
  if (!image?.data || !image.mediaType) return null;
  const ext = extensionFromMediaType(image.mediaType);
  const path = `${userId}/${jobId}.${ext}`;
  const bytes = decodeBase64(image.data);
  const { error } = await admin.storage.from(CAD_IMAGE_BUCKET).upload(path, bytes, {
    contentType: image.mediaType,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

async function saveCadJob(params: {
  userId: string;
  prompt: string;
  image?: { data?: string; mediaType?: string };
  message: string;
  lisp: string;
  entities: Entity[];
  warnings: string[];
}): Promise<{ jobId: string | null; imagePath: string | null; warning?: string }> {
  if (!SERVICE_ROLE_KEY) {
    return {
      jobId: null,
      imagePath: null,
      warning: "Riwayat CAD tidak disimpan: SUPABASE_SERVICE_ROLE_KEY belum tersedia.",
    };
  }

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const jobId = crypto.randomUUID();
    let imagePath: string | null = null;

    try {
      imagePath = await uploadCadJobImage(admin, params.userId, jobId, params.image);
    } catch (imageErr) {
      const reason = imageErr instanceof Error ? imageErr.message : "gagal upload gambar";
      params.warnings.push(`Gambar input tidak tersimpan di riwayat: ${reason}`);
    }

    const { error } = await admin.from("cad_jobs").insert({
      id: jobId,
      user_id: params.userId,
      prompt: params.prompt,
      image_path: imagePath,
      message: params.message,
      lisp: params.lisp,
      entities: params.entities,
      warnings: params.warnings,
    });

    if (error) throw error;
    return { jobId, imagePath };
  } catch (err) {
    return {
      jobId: null,
      imagePath: null,
      warning: `Riwayat CAD gagal disimpan: ${err instanceof Error ? err.message : "kesalahan tak dikenal"}`,
    };
  }
}

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
    const ragContext = agentConfig?.id ? await getRagContext(agentConfig.id) : "";
    const systemPrompt = agentConfig
      ? [agentConfig.system_prompt, ragContext, OUTPUT_CONTRACT].filter(Boolean).join("\n")
      : [SYSTEM_PROMPT, ragContext].filter(Boolean).join("\n");

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
    let rawEntities: unknown[] = [];
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : raw);
      if (typeof parsed.message === "string") reply = parsed.message;
      if (typeof parsed.lisp === "string") lisp = parsed.lisp;
      if (Array.isArray(parsed.entities)) rawEntities = parsed.entities;
    } catch {
      // Fallback: coba ekstrak blok kode LISP dari teks mentah.
      const code = raw.match(/```(?:lisp|autolisp)?\s*([\s\S]*?)```/);
      if (code) {
        lisp = code[1].trim();
        reply = raw.replace(code[0], "").trim();
      }
    }

    const validation = validateEntities(rawEntities);
    const dxf = generateDxf(validation.entities);
    const job = await saveCadJob({
      userId: userData.user.id,
      prompt: message,
      image,
      message: reply,
      lisp,
      entities: validation.entities,
      warnings: validation.warnings,
    });
    if (job.warning) validation.warnings.push(job.warning);

    return json({
      message: reply,
      lisp,
      entities: validation.entities,
      dxf,
      warnings: validation.warnings,
      job_id: job.jobId,
      image_path: job.imagePath,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Kesalahan tak terduga." }, 500);
  }
});
