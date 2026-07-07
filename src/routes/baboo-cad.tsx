import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Check,
  Code2,
  Copy,
  Download,
  FileCode2,
  ImagePlus,
  Loader2,
  Ruler,
  Send,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/baboo-cad")({
  head: () => ({
    meta: [
      { title: "Baboo CAD — Drafter Teknik AI | Baboo.id" },
      {
        name: "description",
        content:
          "Baboo CAD membantu mengubah sketsa, ukuran, dan instruksi gambar teknik menjadi script AutoLISP siap pakai untuk AutoCAD.",
      },
    ],
  }),
  component: BabooCadPage,
});

type ChatMsg = {
  role: "user" | "assistant";
  content: string;
  imagePreview?: string;
  lisp?: string;
};

type AgentResponse = {
  message?: string;
  lisp?: string;
  error?: string;
};

const ALLOWED_MEDIA = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const quickPrompts = [
  "Buat denah ruangan 3x4 meter dengan pintu 80 cm di sisi depan.",
  "Gambar detail kolom 30x30 cm, 8D16, sengkang D8-150.",
  "Buat pondasi batu kali trapesium lebar atas 30 cm, bawah 60 cm, tinggi 70 cm.",
];

function BabooCadPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<{ data: string; mediaType: string; preview: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const lastLisp = [...messages].reverse().find((msg) => msg.lisp)?.lisp;

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/masuk" });
  }, [loading, user, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  function onPickImage(file: File | undefined) {
    setError(null);
    if (!file) return;

    if (!ALLOWED_MEDIA.includes(file.type)) {
      setError("Format gambar harus PNG, JPEG, WebP, atau GIF.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError("Gambar terlalu besar. Maksimum 5MB ya, biar server tidak ngos-ngosan.");
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

    const sentImage = image;
    const userMsg: ChatMsg = {
      role: "user",
      content: message || "Tolong baca sketsa ini dan buatkan gambar CAD-nya.",
      imagePreview: sentImage?.preview,
    };

    setSending(true);
    setError(null);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setImage(null);

    try {
      const history = messages
        .filter((m) => m.content)
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));

      const { data, error: fnError } = await supabase.functions.invoke("cad-agent", {
        body: {
          message: userMsg.content,
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
          content: res?.message ?? "Selesai. Script CAD sudah saya siapkan.",
          lisp: res?.lisp || undefined,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses gambar CAD.");
      setMessages((prev) => prev.slice(0, -1));
      setInput(message);
      if (sentImage) setImage(sentImage);
    } finally {
      setSending(false);
    }
  }

  function copyLisp() {
    if (!lastLisp) return;
    navigator.clipboard.writeText(lastLisp).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function downloadLisp() {
    if (!lastLisp) return;
    const blob = new Blob([lastLisp], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "baboo-cad.lsp";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-deep">
        <Loader2 className="h-8 w-8 animate-spin text-mint-deep" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1180px] flex-1 px-7 py-10">
        <section className="card-pop overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border-b-2 border-navy/10 bg-cream-deep/45 p-7 lg:border-b-0 lg:border-r-2">
              <p className="eyebrow text-mint-deep">Baboo CAD</p>
              <h1 className="mt-3 font-display text-[clamp(32px,5vw,56px)] font-extrabold leading-none text-navy">
                Drafter teknik AI untuk gambar AutoCAD.
              </h1>
              <p className="mt-4 max-w-xl text-[16px] leading-7 opacity-80">
                Upload sketsa, foto coretan, atau tulis instruksi. Baboo CAD akan bantu membuat
                output teknis berupa script AutoLISP yang bisa dibuka di AutoCAD.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  [Ruler, "Baca ukuran", "Memahami dimensi, notasi, dan bentuk dasar gambar."],
                  [FileCode2, "Generate LISP", "Output script .lsp siap dicoba via APPLOAD."],
                  [Bot, "Revisi via chat", "Ubah ukuran, geser objek, atau tambah detail lewat teks."],
                ].map(([Icon, title, desc]) => (
                  <div key={String(title)} className="rounded-2xl border-2 border-navy/15 bg-cream p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint text-navy-deep">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-display text-base font-extrabold text-navy">{title}</h3>
                        <p className="mt-1 text-sm opacity-70">{desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex min-h-[680px] flex-col">
              <header className="flex items-center justify-between gap-3 border-b-2 border-navy/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-mint text-navy-deep">
                    <Ruler className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-extrabold text-navy">Ruang Kerja Baboo CAD</h2>
                    <p className="text-xs opacity-60">Sketsa / teks → AutoLISP untuk AutoCAD</p>
                  </div>
                </div>
                <Sparkles className="h-5 w-5 text-mint-deep" />
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                {messages.length === 0 ? (
                  <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                    <div className="grid h-20 w-20 place-items-center rounded-3xl bg-cream-deep">
                      <UploadCloud className="h-9 w-9 text-mint-deep" />
                    </div>
                    <h3 className="mt-5 font-display text-xl font-extrabold text-navy">
                      Mulai dari sketsa atau instruksi singkat
                    </h3>
                    <p className="mt-2 max-w-md text-sm opacity-70">
                      Klik upload untuk kirim gambar, atau pilih contoh prompt di bawah. Tenang,
                      drafter digitalnya nggak minta kopi dulu.
                    </p>
                    <div className="mt-5 grid w-full max-w-xl gap-2">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => send(prompt)}
                          className="rounded-2xl border-2 border-navy/15 bg-cream px-4 py-3 text-left text-sm transition hover:-translate-y-0.5 hover:border-mint-deep"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
                      <div
                        className={
                          msg.role === "user"
                            ? "max-w-[85%] rounded-2xl rounded-br-sm bg-navy px-4 py-3 text-sm text-cream"
                            : "max-w-[85%] rounded-2xl rounded-bl-sm border-2 border-navy/10 bg-cream px-4 py-3 text-sm"
                        }
                      >
                        {msg.imagePreview ? (
                          <img src={msg.imagePreview} alt="Gambar terunggah" className="mb-2 max-h-44 rounded-xl" />
                        ) : null}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {msg.lisp ? (
                          <div className="mt-3 rounded-xl bg-navy p-3 text-cream">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <span className="flex items-center gap-1 text-xs font-bold">
                                <Code2 className="h-3.5 w-3.5" /> Script LISP
                              </span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={copyLisp}
                                  className="rounded-lg bg-cream px-2 py-1 text-xs font-bold text-navy"
                                >
                                  {copied ? "Tersalin" : "Salin"}
                                </button>
                                <button
                                  type="button"
                                  onClick={downloadLisp}
                                  className="rounded-lg bg-mint px-2 py-1 text-xs font-bold text-navy-deep"
                                >
                                  .lsp
                                </button>
                              </div>
                            </div>
                            <pre className="max-h-64 overflow-auto text-xs leading-relaxed">
                              <code>{msg.lisp}</code>
                            </pre>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}

                {sending ? (
                  <div className="flex items-center gap-2 text-sm opacity-65">
                    <Loader2 className="h-4 w-4 animate-spin" /> Baboo CAD sedang menggambar…
                  </div>
                ) : null}
                <div ref={bottomRef} />
              </div>

              {error ? (
                <p className="mx-5 mb-2 rounded-xl bg-coral/15 px-3 py-2 text-xs text-coral-deep">{error}</p>
              ) : null}

              <footer className="border-t-2 border-navy/10 p-4">
                {image ? (
                  <div className="mb-3 flex items-center gap-2 rounded-2xl border-2 border-navy/10 bg-cream p-2">
                    <img src={image.preview} alt="Preview upload" className="h-14 w-14 rounded-xl object-cover" />
                    <p className="flex-1 text-xs opacity-70">Gambar siap dikirim ke Baboo CAD.</p>
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="grid h-8 w-8 place-items-center rounded-full bg-navy/10 hover:bg-navy/20"
                      aria-label="Hapus gambar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}

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
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-2 border-navy/15 bg-cream transition hover:border-mint-deep"
                    aria-label="Upload gambar"
                    title="Upload gambar"
                  >
                    <ImagePlus className="h-5 w-5" />
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
                    placeholder="Contoh: buat denah 6x8 meter, 2 kamar, 1 kamar mandi..."
                    className="min-h-11 flex-1 resize-none rounded-2xl border-2 border-navy/15 bg-cream px-4 py-3 text-sm outline-none focus:border-mint-deep"
                  />
                  <button
                    type="button"
                    onClick={() => send()}
                    disabled={sending || (!input.trim() && !image)}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mint-deep text-cream transition hover:opacity-90 disabled:opacity-40"
                    aria-label="Kirim"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>

                {lastLisp ? (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={copyLisp}
                      className="inline-flex items-center gap-1 rounded-full border-2 border-navy/15 px-3 py-1.5 font-bold hover:border-mint-deep"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Script tersalin" : "Salin script terakhir"}
                    </button>
                    <button
                      type="button"
                      onClick={downloadLisp}
                      className="inline-flex items-center gap-1 rounded-full bg-navy px-3 py-1.5 font-bold text-cream"
                    >
                      <Download className="h-3.5 w-3.5" /> Download .lsp
                    </button>
                  </div>
                ) : null}
              </footer>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
