import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Bot, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { supabase } from "@/lib/supabase";

type DemoAgentKey = "mandor" | "civil" | "cad" | "architect";
type ChatMessage = { role: "user" | "assistant"; content: string };

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
          "Coba demo AI Agent Baboo dengan tampilan preview seperti di dashboard. Pilih agent, kirim pesan, dan lihat respons langsung.",
      },
      { property: "og:title", content: "Demo Agent Baboo" },
      {
        property: "og:description",
        content: "Halaman demo publik dengan pengalaman chat seperti preview agent di dashboard Baboo.",
      },
    ],
  }),
  component: DemoAgentPage,
});

function DemoAgentPage() {
  const [agentKey, setAgentKey] = useState<DemoAgentKey>("cad");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const agent = useMemo(
    () => demoAgents.find((item) => item.key === agentKey) ?? demoAgents[0],
    [agentKey],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  function changeAgent(nextKey: DemoAgentKey) {
    setAgentKey(nextKey);
    setMessages([]);
    setInput("");
    window.setTimeout(() => inputRef.current?.focus(), 80);
  }

  async function send(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || busy) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const { data, error } = await supabase.functions.invoke("agent-demo", {
        body: {
          agent_key: agentKey,
          messages: next,
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
              Pilih agent, tulis kebutuhanmu, lalu lihat bagaimana Baboo membantu pekerjaan teknis.
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

                {messages.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setMessages([])}
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
                    <button
                      type="button"
                      onClick={() => void send(agent.prompt)}
                      className="mt-5 rounded-full border border-navy/15 bg-cream-deep px-4 py-2 text-sm font-bold text-navy transition hover:border-mint-deep"
                    >
                      Gunakan contoh pertanyaan
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5 py-2">
                    {messages.map((message, index) =>
                      message.role === "user" ? (
                        <div key={index} className="flex justify-end">
                          <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-navy px-4 py-3 text-[15px] leading-relaxed text-cream">
                            {message.content}
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
                          <Loader2 className="h-4 w-4 animate-spin" /> Sedang berpikir…
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
                <div className="flex items-end gap-2 rounded-2xl border-2 border-navy/15 bg-white p-2 shadow-[0_2px_12px_rgba(11,27,46,0.05)] focus-within:border-navy/30">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={Math.min(6, Math.max(1, input.split("\n").length))}
                    placeholder={`Tulis pesan untuk ${agent.name}…`}
                    className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] leading-relaxed outline-none placeholder:text-navy/35"
                  />
                  <button
                    type="button"
                    onClick={() => void send()}
                    disabled={!input.trim() || busy}
                    aria-label="Kirim"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy text-cream transition enabled:hover:bg-navy/85 disabled:opacity-25"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-center text-[11px] text-navy/35">
                  Demo menggunakan konfigurasi AI Lab. Jawaban AI dapat keliru.
                </p>
              </div>
            </div>
          </main>
        </div>
      </section>
    </SiteShell>
  );
}
