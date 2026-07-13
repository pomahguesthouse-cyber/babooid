// =============================================================
// Baboo Proyek — Edge Function (Supabase / Deno)
// Satu layanan tim konstruksi. Baboo Mandor (koordinator) menerima
// input user, memilih sub-agent yang tepat (Civil / CAD / Architect),
// lalu menjawab sebagai agent itu dengan keahlian penuhnya.
//
// Secret yang dibutuhkan:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// Deploy:
//   supabase functions deploy baboo-mandor
// =============================================================

// @ts-expect-error — modul Deno diselesaikan saat runtime di Supabase.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Deno global tersedia di runtime Supabase Edge Functions.
declare const Deno: { env: { get(key: string): string | undefined } };

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUB_AGENTS: Record<string, string> = {
  civil:
    "Baboo Civil — insinyur sipil. Ahli struktur, beban, pondasi, material, " +
    "RAB ringkas, standar SNI, dan analisis teknis konstruksi.",
  cad:
    "Baboo CAD — drafter/penggambar teknik. Ahli gambar kerja, layer, dimensi, " +
    "denah/potongan/detail, konvensi DWG, dan standar penggambaran.",
  architect:
    "Baboo Architect — arsitek. Ahli konsep desain, tata ruang, fasad, " +
    "sirkulasi, estetika, kebutuhan ruang, dan regulasi bangunan.",
};

function systemPrompt(context: string) {
  return [
    "Kamu adalah **Baboo Proyek**, satu layanan tim konstruksi di platform Baboo.id.",
    "Di dalam layanan ini kamu berperan sebagai **Baboo Mandor**, sang koordinator,",
    "yang membawahi sub-agent spesialis berikut:",
    ...Object.entries(SUB_AGENTS).map(([k, v]) => `- ${k}: ${v}`),
    "",
    "Tugasmu: baca permintaan user tentang proyek mereka, tentukan SATU sub-agent",
    "yang paling tepat menanganinya, lalu jawab sebagai sub-agent tersebut dengan",
    "keahlian penuhnya. Setiap spesialis tetap memakai keahliannya masing-masing.",
    "Jika permintaan bersifat umum/koordinasi, jawab sebagai 'mandor'.",
    "Jawab dalam Bahasa Indonesia yang jelas, ringkas, dan praktis.",
    "",
    "Konteks proyek:",
    context || "(belum ada konteks tambahan)",
    "",
    "WAJIB balas HANYA dalam JSON valid tanpa teks lain, bentuk:",
    '{"agent":"civil|cad|architect|mandor","message":"jawabanmu di sini"}',
  ].join("\n");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    if (!ANTHROPIC_API_KEY) {
      return json({ error: "ANTHROPIC_API_KEY belum diset di secrets Edge Function." }, 500);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Tidak terautentikasi." }, 401);

    // Client memakai JWT user → RLS otomatis berlaku.
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Sesi tidak valid." }, 401);
    const userId = userData.user.id;

    const { projectId, message } = await req.json();
    if (!projectId || !message || typeof message !== "string") {
      return json({ error: "projectId dan message wajib diisi." }, 400);
    }

    // Pastikan proyek milik user (RLS sudah menjaga, ini sekadar validasi).
    const { data: project, error: projErr } = await supabase
      .from("projects")
      .select("id, name, description")
      .eq("id", projectId)
      .single();
    if (projErr || !project) return json({ error: "Proyek tidak ditemukan." }, 404);

    // Simpan pesan user.
    await supabase.from("messages").insert({
      project_id: projectId,
      user_id: userId,
      role: "user",
      agent: "mandor",
      content: message,
    });

    // Kumpulkan konteks: deskripsi proyek, daftar file, riwayat singkat.
    const { data: files } = await supabase
      .from("project_files")
      .select("name, mime_type")
      .eq("project_id", projectId)
      .limit(30);

    const { data: history } = await supabase
      .from("messages")
      .select("role, agent, content")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(12);

    const recent = (history ?? []).reverse();

    const context = [
      `Nama proyek: ${project.name}`,
      project.description ? `Deskripsi: ${project.description}` : null,
      files && files.length
        ? `File pendukung: ${files.map((f) => f.name).join(", ")}`
        : "File pendukung: (belum ada)",
    ]
      .filter(Boolean)
      .join("\n");

    const messagesForLlm = recent.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content:
        m.role === "assistant" && m.agent !== "mandor"
          ? `[${m.agent}] ${m.content}`
          : m.content,
    }));

    // Panggil Anthropic.
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system: systemPrompt(context),
        messages: messagesForLlm.length
          ? messagesForLlm
          : [{ role: "user", content: message }],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return json({ error: `LLM error: ${errText}` }, 502);
    }

    const data = await resp.json();
    const raw: string = data?.content?.[0]?.text ?? "";

    // Parse JSON dari model secara defensif.
    let agent = "mandor";
    let answer = raw;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : raw);
      if (parsed.agent && ["civil", "cad", "architect", "mandor"].includes(parsed.agent)) {
        agent = parsed.agent;
      }
      if (typeof parsed.message === "string") answer = parsed.message;
    } catch {
      // Biarkan fallback: agent=mandor, answer=raw.
    }

    // Simpan balasan assistant.
    const { data: saved, error: saveErr } = await supabase
      .from("messages")
      .insert({
        project_id: projectId,
        user_id: userId,
        role: "assistant",
        agent,
        content: answer,
      })
      .select()
      .single();

    if (saveErr) return json({ error: saveErr.message }, 500);

    return json({ message: saved });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Kesalahan tak terduga." }, 500);
  }
});
