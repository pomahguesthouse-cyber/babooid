import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Ruler,
  ImagePlus,
  Send,
  Loader2,
  Copy,
  Check,
  Download,
  X,
  Code2,
  Shapes,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/cad-agent")({
  head: () => ({
    meta: [
      { title: "CAD Agent — Generator AutoLISP dari Gambar | Baboo.id" },
      {
        name: "description",
        content:
          "Upload sketsa atau denah, CAD Agent menerjemahkannya menjadi script AutoLISP siap dijalankan di AutoCAD, lengkap dengan preview 2D.",
      },
    ],
  }),
  component: CadAgentPage,
});

// ---------- Tipe data ----------

type Entity =
  | { type: "line"; p1: [number, number]; p2: [number, number]; layer?: string }
  | { type: "circle"; center: [number, number]; r: number; layer?: string }
  | {
      type: "arc";
      center: [number, number];
      r: number;
      start: number;
      end: number;
      layer?: string;
    }
  | { type: "polyline"; points: [number, number][]; closed?: boolean; layer?: string }
  | { type: "text"; at: [number, number]; h: number; value: string; layer?: string };

type ChatMsg = {
  role: "user" | "assistant";
  content: string;
  imagePreview?: string;
  lisp?: string;
  entities?: Entity[];
};

type AgentResponse = { message?: string; lisp?: string; entities?: Entity[]; error?: string };

const ALLOWED_MEDIA = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const EXAMPLE_PROMPTS = [
  "Gambar denah kamar 3x4 meter dengan pintu 80cm di sisi selatan",
  "Buat detail kolom 30x30 cm dengan 8 tulangan D16 dan sengkang D8-150",
  "Gambar pondasi batu kali trapesium lebar atas 30cm, bawah 60cm, tinggi 70cm",
];

// ---------- Preview 2D (SVG) ----------

const LAYER_COLORS: Record<string, string> = {};
const PALETTE = ["#0F6E56", "#a63d14", "#8a5a00", "#1d4ed8", "#7c3aed", "#be185d"];

function layerColor(layer?: string): string {
  if (!layer) return "#1e2a3a";
  if (!LAYER_COLORS[layer]) {
    LAYER_COLORS[layer] = PALETTE[Object.keys(LAYER_COLORS).length % PALETTE.length];
  }
  return LAYER_COLORS[layer];
}

function entityBounds(entities: Entity[]) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  const add = (x: number, y: number) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  };
  for (const e of entities) {
    if (e.type === "line") {
      add(...e.p1);
      add(...e.p2);
    } else if (e.type === "circle" || e.type === "arc") {
      add(e.center[0] - e.r, e.center[1] - e.r);
      add(e.center[0] + e.r, e.center[1] + e.r);
    } else if (e.type === "polyline") {
      e.points.forEach((p) => add(...p));
    } else if (e.type === "text") {
      add(...e.at);
      add(e.at[0] + e.value.length * e.h * 0.6, e.at[1] + e.h);
    }
  }
  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

function EntityPreview({ entities }: { entities: Entity[] }) {
  const bounds = useMemo(() => entityBounds(entities), [entities]);
  if (!bounds) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center text-sm opacity-50">
        Belum ada geometri untuk ditampilkan.
      </div>
    );
  }
  const pad = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY, 1) * 0.06;
  const w = bounds.maxX - bounds.minX + pad * 2;
  const h = bounds.maxY - bounds.minY + pad * 2;
  // CAD pakai sumbu Y ke atas, SVG ke bawah → flip Y.
  const mx = (x: number) => x - bounds.minX + pad;
  const my = (y: number) => bounds.maxY - y + pad;
  const stroke = Math.max(w, h) / 300;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-full w-full"
      style={{ maxHeight: 480 }}
      preserveAspectRatio="xMidYMid meet"
    >
      {entities.map((e, i) => {
        const color = layerColor(e.layer);
        if (e.type === "line") {
          return (
            <line
              key={i}
              x1={mx(e.p1[0])}
              y1={my(e.p1[1])}
              x2={mx(e.p2[0])}
              y2={my(e.p2[1])}
              stroke={color}
              strokeWidth={stroke}
            />
          );
        }
        if (e.type === "circle") {
          return (
            <circle
              key={i}
              cx={mx(e.center[0])}
              cy={my(e.center[1])}
              r={e.r}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
            />
          );
        }
        if (e.type === "arc") {
          const a1 = (e.start * Math.PI) / 180;
          const a2 = (e.end * Math.PI) / 180;
          const sx = mx(e.center[0] + e.r * Math.cos(a1));
          const sy = my(e.center[1] + e.r * Math.sin(a1));
          const ex = mx(e.center[0] + e.r * Math.cos(a2));
          const ey = my(e.center[1] + e.r * Math.sin(a2));
          const sweepDeg = (((e.end - e.start) % 360) + 360) % 360;
          const large = sweepDeg > 180 ? 1 : 0;
          return (
            <path
              key={i}
              d={`M ${sx} ${sy} A ${e.r} ${e.r} 0 ${large} 0 ${ex} ${ey}`}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
            />
          );
        }
        if (e.type === "polyline") {
          const pts = e.points.map((p) => `${mx(p[0])},${my(p[1])}`).join(" ");
          return e.closed ? (
            <polygon key={i} points={pts} fill="none" stroke={color} strokeWidth={stroke} />
          ) : (
            <polyline key={i} points={pts} fill="none" stroke={color} strokeWidth={stroke} />
          );
        }
        if (e.type === "text") {
          return (
            <text
              key={i}
              x={mx(e.at[0])}
              y={my(e.at[1])}
              fontSize={e.h}
              fill={color}
              fontFamily="monospace"
            >
              {e.value}
            </text>
          );
        }
        return null;
      })}
    </svg>
  );
}

// ---------- Halaman ----------

function CadAgentPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<{ data: string; mediaType: string; preview: string } | null>(
    null,
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"preview" | "lisp">("preview");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/masuk" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const lastResult = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant" && (m.lisp || m.entities?.length)),
    [messages],
  );

  function onPickImage(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!ALLOWED_MEDIA.includes(file.type)) {
      setError("Format gambar harus PNG, JPEG, WebP, atau GIF.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Gambar terlalu besar (maksimum 5MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImage({
        data: dataUrl.split(",")[1] ?? "",
        mediaType: file.type,
        preview: dataUrl,
      });
    };
    reader.readAsDataURL(file);
  }

  async function send(text?: string) {
    const message = (text ?? input).trim();
    if ((!message && !image) || sending) return;
    setSending(true);
    setError(null);

    const userMsg: ChatMsg = { role: "user", content: message, imagePreview: image?.preview };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    const sentImage = image;
    setImage(null);

    try {
      const history = messages
        .filter((m) => m.content)
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));

      const { data, error: fnError } = await supabase.functions.invoke("cad-agent", {
        body: {
          message,
          image: sentImage ? { data: sentImage.data, mediaType: sentImage.mediaType } : undefined,
          history,
        },
      });
      if (fnError) throw fnError;
      const res = data as AgentResponse;
      if (res?.error) throw new Error(res.error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res?.message ?? "Selesai.",
          lisp: res?.lisp || undefined,
          entities: Array.isArray(res?.entities) ? res.entities : undefined,
        },
      ]);
      if (res?.entities?.length) setTab("preview");
      else if (res?.lisp) setTab("lisp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan. Coba lagi.");
      setMessages((prev) => prev.slice(0, -1));
      setInput(message);
      if (sentImage) setImage(sentImage);
    } finally {
      setSending(false);
    }
  }

  function copyLisp() {
    if (!lastResult?.lisp) return;
    navigator.clipboard.writeText(lastResult.lisp).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function downloadLisp() {
    if (!lastResult?.lisp) return;
    const blob = new Blob([lastResult.lisp], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "baboo-cad.lsp";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-deep">
        <Loader2 className="h-8 w-8 animate-spin text-mint-deep" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-[1240px] flex-1 gap-6 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Kolom kiri: chat */}
        <section className="card-pop flex min-h-[70vh] flex-col overflow-hidden">
          <header className="flex items-center gap-3 border-b-2 border-navy/10 px-5 py-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-navy-deep">
              <Ruler className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-lg font-bold text-navy">CAD Agent</h1>
              <p className="text-xs opacity-60">
                Upload sketsa / denah → script AutoLISP untuk AutoCAD
              </p>
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <div className="space-y-3 pt-6 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-mint-deep" />
                <p className="text-sm opacity-70">
                  Upload foto sketsa tangan, denah, atau gambar teknik — atau jelaskan lewat teks.
                  Saya akan buatkan script AutoLISP-nya.
                </p>
                <div className="mx-auto flex max-w-md flex-col gap-2 pt-2">
                  {EXAMPLE_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="rounded-xl border-2 border-navy/15 bg-cream px-3 py-2 text-left text-xs transition hover:border-mint-deep"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-navy px-4 py-3 text-sm text-cream"
                      : "max-w-[85%] rounded-2xl rounded-bl-sm border-2 border-navy/10 bg-cream px-4 py-3 text-sm"
                  }
                >
                  {m.imagePreview && (
                    <img
                      src={m.imagePreview}
                      alt="Gambar terunggah"
                      className="mb-2 max-h-40 rounded-lg"
                    />
                  )}
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {m.role === "assistant" && m.lisp && (
                    <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-mint-deep">
                      <Code2 className="h-3.5 w-3.5" /> Script LISP siap — lihat panel kanan
                    </p>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex items-center gap-2 text-sm opacity-60">
                <Loader2 className="h-4 w-4 animate-spin" /> CAD Agent sedang menggambar…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {error && (
            <p className="mx-5 mb-2 rounded-lg bg-coral/15 px-3 py-2 text-xs text-coral-deep">
              {error}
            </p>
          )}

          <footer className="border-t-2 border-navy/10 p-4">
            {image && (
              <div className="mb-2 flex items-center gap-2">
                <img src={image.preview} alt="Preview" className="h-12 w-12 rounded-lg object-cover" />
                <button
                  onClick={() => setImage(null)}
                  className="rounded-full bg-navy/10 p-1 hover:bg-navy/20"
                  aria-label="Hapus gambar"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <input
                ref={fileRef}
                type="file"
                accept={ALLOWED_MEDIA.join(",")}
                className="hidden"
                onChange={(e) => {
                  onPickImage(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-navy/15 bg-cream transition hover:border-mint-deep"
                aria-label="Upload gambar"
                title="Upload gambar (PNG/JPG/WebP, maks 5MB)"
              >
                <ImagePlus className="h-4 w-4" />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={2}
                placeholder="Jelaskan gambar yang diinginkan, atau upload sketsa…"
                className="min-h-10 flex-1 resize-none rounded-xl border-2 border-navy/15 bg-cream px-3 py-2 text-sm outline-none focus:border-mint-deep"
              />
              <button
                onClick={() => send()}
                disabled={sending || (!input.trim() && !image)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint-deep text-cream transition hover:opacity-90 disabled:opacity-40"
                aria-label="Kirim"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </section>

        {/* Kolom kanan: hasil */}
        <section className="card-pop flex min-h-[70vh] flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b-2 border-navy/10 px-5 py-3">
            <div className="flex gap-1">
              <button
                onClick={() => setTab("preview")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  tab === "preview" ? "bg-mint text-navy-deep" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Shapes className="h-4 w-4" /> Preview 2D
              </button>
              <button
                onClick={() => setTab("lisp")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  tab === "lisp" ? "bg-mint text-navy-deep" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Code2 className="h-4 w-4" /> Script LISP
              </button>
            </div>
            {lastResult?.lisp && (
              <div className="flex gap-1.5">
                <button
                  onClick={copyLisp}
                  className="flex items-center gap-1 rounded-lg border-2 border-navy/15 px-2.5 py-1 text-xs font-semibold transition hover:border-mint-deep"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Tersalin" : "Salin"}
                </button>
                <button
                  onClick={downloadLisp}
                  className="flex items-center gap-1 rounded-lg bg-navy px-2.5 py-1 text-xs font-semibold text-cream transition hover:opacity-90"
                >
                  <Download className="h-3.5 w-3.5" /> .lsp
                </button>
              </div>
            )}
          </header>

          <div className="flex-1 overflow-auto p-4">
            {tab === "preview" ? (
              lastResult?.entities?.length ? (
                <div className="h-full rounded-xl border-2 border-dashed border-navy/15 bg-white p-3">
                  <EntityPreview entities={lastResult.entities} />
                </div>
              ) : (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 text-center text-sm opacity-50">
                  <Shapes className="h-8 w-8" />
                  <p>Preview 2D akan muncul di sini setelah agent menggambar.</p>
                </div>
              )
            ) : lastResult?.lisp ? (
              <pre className="h-full overflow-auto rounded-xl bg-navy p-4 text-xs leading-relaxed text-cream">
                <code>{lastResult.lisp}</code>
              </pre>
            ) : (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 text-center text-sm opacity-50">
                <Code2 className="h-8 w-8" />
                <p>Script AutoLISP akan muncul di sini.</p>
              </div>
            )}
          </div>

          <footer className="border-t-2 border-navy/10 px-5 py-3 text-xs opacity-60">
            Cara pakai: unduh file .lsp → di AutoCAD ketik <b>APPLOAD</b> → pilih file → ketik{" "}
            <b>GAMBAR</b> di command line.
          </footer>
        </section>
      </main>
    </div>
  );
}
