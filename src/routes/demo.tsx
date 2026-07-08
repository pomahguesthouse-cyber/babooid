import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowUp,
  Bot,
  ChevronDown,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/page-hero";
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
      <PageHero
        eyebrow="Demo Agent"
        title={
          <>
            Coba Baboo dengan tampilan <span className="text-mint-deep">preview dashboard</span>
          </>
        }
        desc="Pilih agent, kirim pesan, dan rasakan pengalaman chat seperti preview di dashboard AI Lab. Lebih serius dari playground kemarin—sekarang agent-nya ikut kerja, bukan cuma cosplay."
      />

      <section className="mx-auto max-w-[1180px] px-7 pb-20">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="card-pop p-5">
              <p className="font-display text-sm font-extrabold uppercase tracking-[0.16em] text-mint-deep">
                Pilih Agent
              </p>
              <div className="mt-4 space-y-2.5">
                {demoAgents.map((item) => {
                  const active = item.key === agentKey;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => changeAgent(item.key)}
                      className={`w-full rounded-2xl border-2 p-3 text-left transition ${
                        active
                          ? "border-navy bg-cream shadow-[0_4px_0_rgba(11,27,46,0.18)]"
                          : "border-navy/10 bg-white hover:border-navy/35"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${item.accent}`}>
                          <Bot className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block font-display text-sm font-extrabold text-navy">
                            {item.name}
                          </span>
                          <span className="mt-0.5 block text-xs opacity-60">{item.role}</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[22px] border-[2.5px] border-navy bg-navy p-5 text-cream">
              <div className="flex items-center gap-2 font-display text-base font-extrabold">
                <ShieldCheck className="h-4 w-4 text-mint" />
                Demo live
              </div>
              <p className="mt-2 text-sm text-cream/70">
                Respons memakai konfigurasi agent aktif dari AI Lab. Model dan system prompt mengikuti
                setting dashboard.
              </p>
            </div>
          </aside>

          <main className="card-pop flex min-h-[680px] flex-col overflow-hidden bg-white">
            <header className="flex items-center justify-between border-b-2 border-navy/10 bg-cream px-5 py-4">
              <div className="flex items-center gap-3">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl ${agent.accent}`}>
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-extrabold text-navy">Preview — {agent.name}</h2>
                  <p className="text-xs opacity-55">{agent.role} · mode demo publik</p>
                </div>
              </div>

              {messages.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy/70 hover:text-navy"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Mulai ulang
                </button>
              ) : null}
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
              <div className="mx-auto w-full max-w-3xl">
                {messages.length === 0 ? (
                  <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                    <span className={`grid h-16 w-16 place-items-center rounded-3xl ${agent.accent}`}>
                      <Sparkles className="h-8 w-8" />
                    </span>
                    <h1 className="mt-5 font-display text-3xl font-bold text-navy">
                      Halo, saya {agent.name}.
                    </h1>
                    <p className="mt-2 max-w-md text-sm opacity-60">{agent.description}</p>
                    <button
                      type="button"
                      onClick={() => void send(agent.prompt)}
                      className="mt-5 rounded-full border-2 border-navy/15 bg-cream-deep px-4 py-2 text-sm font-bold text-navy transition hover:border-mint-deep"
                    >
                      Coba prompt contoh
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 py-2">
                    {messages.map((message, index) =>
                      message.role === "user" ? (
                        <div key={index} className="flex justify-end">
                          <div className="max-w-[82%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-navy/[0.06] px-4 py-3 text-[15px] leading-relaxed text-navy">
                            {message.content}
                          </div>
                        </div>
                      ) : (
                        <div key={index} className="flex gap-3">
                          <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${agent.accent}`}>
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
                        <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${agent.accent}`}>
                          <Bot className="h-3.5 w-3.5" />
                        </span>
                        <div className="flex items-center gap-2 text-sm opacity-60">
                          <Loader2 className="h-4 w-4 animate-spin" /> Sedang berpikir…
                        </div>
                      </div>
                    ) : null}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>
            </div>

            <div className="mx-auto w-full max-w-3xl px-4 pb-5 pt-2 sm:px-8">
              <div className="rounded-3xl border-2 border-navy/15 bg-white p-3 shadow-[0_2px_12px_rgba(11,27,46,0.06)] focus-within:border-navy/30">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={Math.min(6, Math.max(1, input.split("\n").length))}
                  placeholder={`Tulis pesan untuk ${agent.name}…`}
                  className="max-h-40 w-full resize-none bg-transparent px-2 py-1 text-[15px] leading-relaxed outline-none placeholder:opacity-40"
                />
                <div className="flex items-center justify-between pt-1">
                  <div className="relative inline-flex items-center">
                    <select
                      value={agentKey}
                      onChange={(e) => changeAgent(e.target.value as DemoAgentKey)}
                      aria-label="Pilih agent"
                      className="max-w-[240px] cursor-pointer appearance-none rounded-lg bg-transparent py-1 pl-2 pr-7 text-xs font-semibold text-navy/60 outline-none transition hover:bg-cream-deep hover:text-navy"
                    >
                      {demoAgents.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1.5 h-3.5 w-3.5 text-navy/40" />
                  </div>
                  <button
                    type="button"
                    onClick={() => void send()}
                    disabled={!input.trim() || busy}
                    aria-label="Kirim"
                    className="grid h-9 w-9 place-items-center rounded-xl bg-navy text-cream transition enabled:hover:bg-navy/85 disabled:opacity-25"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] opacity-40">
                Demo memakai system prompt dan model dari AI Lab. Jawaban AI bisa keliru.
              </p>
            </div>
          </main>
        </div>
      </section>
    </SiteShell>
  );
}
