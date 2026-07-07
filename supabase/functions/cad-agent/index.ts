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
const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";

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
    if (!ANTHROPIC_API_KEY) {
      return json({ error: "ANTHROPIC_API_KEY belum diset di secrets Edge Function." }, 500);
    }

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

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: messagesForLlm,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return json({ error: `LLM error: ${errText}` }, 502);
    }

    const data = await resp.json();
    const raw: string = data?.content?.[0]?.text ?? "";

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
