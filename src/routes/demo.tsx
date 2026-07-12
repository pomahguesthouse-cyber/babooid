import { createFileRoute } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
  type KeyboardEvent,
} from "react";
import {
  ArrowUp,
  Bot,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { supabase } from "@/lib/supabase";

type DemoAgentKey = "mandor" | "civil" | "cad" | "architect";
type AttachmentSummary = { name: string; mimeType: string; size: number };
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  attachment?: AttachmentSummary;
};
type DemoAttachment = AttachmentSummary & {
  data: string;
  previewUrl?: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const demoAgents = [
  {
    key: "mandor",
    name: "Baboo Mandor",
    role: "Orchestrator proyek",
    description: "Mengoordinasi kebutuhan user dan meneruskan pekerjaan ke agent yang paling tepat.",
    accent: "bg-navy text-cream",
    prompt: "Saya ingin membuat workflow agent untuk bisnis saya. Mulai dari mana?",
  },
  {
    key: "civil",
    name: "Baboo Civil",
    role: "Insinyur Sipil",
    description: "Membantu analisis struktur, pondasi, material, beban, dan kebutuhan teknis konstruksi.",
    accent: "bg-sun text-navy-deep",
    prompt: "Analisa konsep struktur rumah 2 lantai rangka baja dengan plat bondek.",
  },
  {
    key: "cad",
    name: "Baboo CAD",
    role: "Drafter Teknik",
    description: "Membantu membuat instruksi gambar kerja, denah, detail, potongan, dan konsep CAD.",
    accent: "bg-mint text-navy-deep",
    prompt: "Buat instruksi gambar denah kamar 3x4 meter dengan pintu 80 cm.",
  },
  {
    key: "architect",
    name: "Baboo Architect",
    role: "Arsitek",
    description: "Membantu konsep desain, tata ruang, fasad, sirkulasi, dan pengalaman ruang.",
    accent: "bg-coral text-navy-deep",
    prompt: "Buat konsep fasad rumah modern tropis di lahan 6x12 meter.",
  },
] as const;

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo Agent Baboo — Preview AI Agent | Baboo.id" },
      {
        name: "description",
        content:
          "Coba demo AI Agent Baboo, unggah gambar atau PDF, kirim pesan, dan lihat respons langsung.",
      },
      { property: "og:title", content: "Demo Agent Baboo" },
      {
        property: "og:description",
        content: "Halaman demo publik Baboo dengan chat dan analisis lampiran gambar atau PDF.",
      },
    ],
  }),
  component: DemoAgentPage,
});

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const separator = result.indexOf(",");
      if (separator < 0) {
        reject(new Error("File tidak dapat dibaca."));
        return;
      }
      resolve(result.slice(separator + 1));
    };
    reader.onerror = () => reject(new Error("File tidak dapat dibaca."));
    reader.readAsDataURL(file);
  });
}

function DemoAgentPage() {
  const [agentKey, setAgentKey] = useState<DemoAgentKey>("cad");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [attachment, setAttachment] = useState<DemoAttachment | null>(null);
  const [dragging, setDragging] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragDepthRef = useRef(0);

  const agent = useMemo(
    () => demoAgents.find((item) => item.key === agentKey) ?? demoAgents[0],
    [agentKey],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    return () => {
      if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    };
  }, [attachment]);

  function resetConversation() {
    setMessages([]);
    setInput("");
    setAttachment(null);
  }

  function changeAgent(nextKey: DemoAgentKey) {
    setAgentKey(nextKey);
    resetConversation();
    window.setTimeout(() => inputRef.current?.focus(), 80);
  }

  async function chooseFile(file?: File) {
    if (!file) return;
    if (!ACCEPTED_FILE_TYPES.has(file.type)) {
      toast.error("Format file belum didukung. Gunakan JPG, PNG, WEBP, atau PDF.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ukuran file maksimal 5 MB.");
      return;
    }

    try {
      const data = await fileToBase64(file);
      setAttachment({
        name: file.name,
        mimeType: file.type,
        size: file.size,
        data,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      });
      window.setTimeout(() => inputRef.current?.focus(), 50);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "File tidak dapat dibaca.");
    }
  }

  function onFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    void chooseFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function hasDraggedFiles(event: ReactDragEvent<HTMLElement>) {
    return Array.from(event.dataTransfer.types).includes("Files");
  }

  function onDragEnter(event: ReactDragEvent<HTMLElement>) {
    if (!hasDraggedFiles(event)) return;
    event.preventDefault();
    dragDepthRef.current += 1;
    setDragging(true);
  }

  function onDragOver(event: ReactDragEvent<HTMLElement>) {
    if (!hasDraggedFiles(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function onDragLeave(event: ReactDragEvent<HTMLElement>) {
    if (!hasDraggedFiles(event)) return;
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setDragging(false);
  }

  function onDrop(event: ReactDragEvent<HTMLElement>) {
    event.preventDefault();
    dragDepthRef.current = 0;
    setDragging(false);
    void chooseFile(event.dataTransfer.files?.[0]);
  }

  async function send(textOverride?: string) {
    const typedText = (textOverride ?? input).trim();
    if ((!typedText && !attachment) || busy) return;

    const text = typedText || "Analisis lampiran ini dan jelaskan temuan utamanya.";
    const summary = attachment
      ? { name: attachment.name, mimeType: attachment.mimeType, size: attachment.size }
      : undefined;
    const next: ChatMessage[] = [...messages, { role: "user", content: text, attachment: summary }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const { data, error } = await supabase.functions.invoke("agent-demo", {
        body: {
          agent_key: agentKey,
          messages: next.map(({ role, content }) => ({ role, content })),
          attachment: attachment
            ? {
                name: attachment.name,
                mime_type: attachment.mimeType,
                size: attachment.size,
                data: attachment.data,
              }
            : null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setMessages([...next, { role: "assistant", content: data?.message ?? "(kosong)" }]);
    } catch (err) {
      let message = err instanceof Error ? err.message : "Demo agent belum bisa dihubungi.";
      const ctx = (err as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") {
        try {
          const body = await ctx.clone().json();
          if (body?.error) message = String(body.error);
        } catch {
          /* biarkan pesan default */
        }
      }
      toast.error(message, { duration: 8000 });
      setMessages(next);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <SiteShell>
      <section className="bg-cream-deep/60 px-4 py-8 sm:px-7 sm:py-12">
        <div className="mx-auto max-w-[960px]">
          <div className="mb-6 text-center">
            <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-mint-deep">
              Demo Agent
            </p>
            <h1 className="mt-2 font-display text-[clamp(30px,4vw,42px)] font-extrabold text-navy">
              Coba Baboo langsung
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-navy/65 sm:text-[15px]">
              Tulis kebutuhanmu atau unggah gambar/PDF untuk dianalisis oleh agent Baboo.
            </p>
          </div>

          <main className="card-pop flex min-h-[640px] flex-col overflow-hidden bg-white">
            <div className="border-b-2 border-navy/10 bg-cream px-4 py-3 sm:px-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${agent.accent}`}>
                    <Sparkles className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-base font-extrabold text-navy sm:text-lg">
                      {agent.name}
                    </h2>
                    <p className="truncate text-xs text-navy/50">{agent.role}</p>
                  </div>
                </div>

                {messages.length > 0 || attachment ? (
                  <button
                    type="button"
                    onClick={resetConversation}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy/65 transition hover:border-navy/30 hover:text-navy"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Mulai ulang</span>
                  </button>
                ) : null}
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {demoAgents.map((item) => {
                  const active = item.key === agentKey;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => changeAgent(item.key)}
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                        active
                          ? "border-navy bg-navy text-cream"
                          : "border-navy/10 bg-white text-navy/60 hover:border-navy/25 hover:text-navy"
                      }`}
                    >
                      {item.name.replace("Baboo ", "")}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-7">
              <div className="mx-auto w-full max-w-3xl">
                {messages.length === 0 ? (
                  <div className="flex min-h-[370px] flex-col items-center justify-center text-center">
                    <span className={`grid h-14 w-14 place-items-center rounded-2xl ${agent.accent}`}>
                      <Bot className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 font-display text-2xl font-bold text-navy">
                      Halo, saya {agent.name}.
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-navy/55">
                      {agent.description}
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => void send(agent.prompt)}
                        className="rounded-full border border-navy/15 bg-cream-deep px-4 py-2 text-sm font-bold text-navy transition hover:border-mint-deep"
                      >
                        Gunakan contoh pertanyaan
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-2 text-sm font-bold text-navy transition hover:border-mint-deep"
                      >
                        <Paperclip className="h-4 w-4" /> Unggah file
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 py-2">
                    {messages.map((message, index) =>
                      message.role === "user" ? (
                        <div key={index} className="flex justify-end">
                          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-navy px-4 py-3 text-cream">
                            {message.attachment ? (
                              <div className="mb-2 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs">
                                {message.attachment.mimeType === "application/pdf" ? (
                                  <FileText className="h-4 w-4 shrink-0" />
                                ) : (
                                  <ImageIcon className="h-4 w-4 shrink-0" />
                                )}
                                <span className="min-w-0 truncate font-semibold">
                                  {message.attachment.name}
                                </span>
                                <span className="shrink-0 text-cream/60">
                                  {formatFileSize(message.attachment.size)}
                                </span>
                              </div>
                            ) : null}
                            <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                              {message.content}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div key={index} className="flex gap-3">
                          <span
                            className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${agent.accent}`}
                          >
                            <Bot className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0 whitespace-pre-wrap text-[15px] leading-relaxed text-navy/90">
                            {message.content}
                          </div>
                        </div>
                      ),
                    )}

                    {busy ? (
                      <div className="flex gap-3">
                        <span
                          className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${agent.accent}`}
                        >
                          <Bot className="h-3.5 w-3.5" />
                        </span>
                        <div className="flex items-center gap-2 text-sm text-navy/50">
                          <Loader2 className="h-4 w-4 animate-spin" /> Sedang menganalisis…
                        </div>
                      </div>
                    ) : null}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-navy/10 bg-white px-4 pb-4 pt-3 sm:px-7 sm:pb-5">
              <div className="mx-auto w-full max-w-3xl">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={onFileInputChange}
                  className="hidden"
                />

                <div
                  onDragEnter={onDragEnter}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={`relative rounded-2xl border-2 bg-white p-2 shadow-[0_2px_12px_rgba(11,27,46,0.05)] transition ${
                    dragging ? "border-mint-deep bg-mint/10" : "border-navy/15 focus-within:border-navy/30"
                  }`}
                >
                  {dragging ? (
                    <div className="absolute inset-0 z-10 grid place-items-center rounded-[14px] bg-cream/95 text-center">
                      <div>
                        <Paperclip className="mx-auto h-6 w-6 text-mint-deep" />
                        <p className="mt-1 text-sm font-bold text-navy">Lepaskan file di sini</p>
                        <p className="text-xs text-navy/50">Gambar atau PDF, maksimal 5 MB</p>
                      </div>
                    </div>
                  ) : null}

                  {attachment ? (
                    <div className="mb-2 flex items-center gap-3 rounded-xl border border-navy/10 bg-cream-deep/70 p-2 pr-3">
                      {attachment.previewUrl ? (
                        <img
                          src={attachment.previewUrl}
                          alt="Preview lampiran"
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-coral/25 text-navy">
                          <FileText className="h-5 w-5" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-navy">{attachment.name}</p>
                        <p className="text-xs text-navy/45">
                          {formatFileSize(attachment.size)} · lampiran aktif
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachment(null)}
                        disabled={busy}
                        aria-label="Hapus lampiran"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-navy/45 transition hover:bg-white hover:text-navy disabled:opacity-30"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}

                  <div className="flex items-end gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={busy}
                      title="Unggah gambar atau PDF"
                      aria-label="Unggah gambar atau PDF"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-navy/50 transition hover:bg-cream-deep hover:text-navy disabled:opacity-30"
                    >
                      <Paperclip className="h-4.5 w-4.5" />
                    </button>
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      rows={Math.min(6, Math.max(1, input.split("\n").length))}
                      placeholder={
                        attachment
                          ? "Tulis instruksi untuk lampiran ini…"
                          : `Tulis pesan untuk ${agent.name}…`
                      }
                      className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] leading-relaxed outline-none placeholder:text-navy/35"
                    />
                    <button
                      type="button"
                      onClick={() => void send()}
                      disabled={(!input.trim() && !attachment) || busy}
                      aria-label="Kirim"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy text-cream transition enabled:hover:bg-navy/85 disabled:opacity-25"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-center text-[11px] text-navy/35">
                  JPG, PNG, WEBP, atau PDF · maksimal 5 MB · PDF mengikuti dukungan model aktif.
                </p>
              </div>
            </div>
          </main>
        </div>
      </section>
    </SiteShell>
  );
}
