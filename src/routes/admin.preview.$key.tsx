import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowUp, Bot, ChevronDown, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAiAgents, useAiProviders } from "@/lib/ai-lab";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/preview/$key")({
  head: () => ({
    meta: [{ title: "Preview Agent — Baboo AI Lab" }],
  }),
  component: PreviewPage,
});

type ChatMessage = { role: "user" | "assistant"; content: string };

function PreviewPage() {
  const { key } = Route.useParams();
  const { data: agents } = useAiAgents();
  const { data: providers } = useAiProviders();
  const agent = agents?.find((a) => a.key === key);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  // Pilihan model untuk sesi preview ini (format "provider:model").
  const [choice, setChoice] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Daftar model dari semua provider yang aktif.
  const modelChoices = useMemo(() => {
    const out: { value: string; label: string; provider: string; model: string }[] = [];
    for (const p of providers ?? []) {
      if (!p.enabled) continue;
      for (const m of p.models.split(",").map((x) => x.trim()).filter(Boolean)) {
        out.push({ value: `${p.key}:${m}`, label: m, provider: p.key, model: m });
      }
    }
    return out;
  }, [providers]);

  // Default: model bawaan agent.
  useEffect(() => {
    if (!choice && agent) setChoice(`${agent.provider ?? "anthropic"}:${agent.model}`);
  }, [agent, choice]);

  const selected = useMemo(() => {
    const [prov, ...rest] = choice.split(":");
    return { provider: prov || (agent?.provider ?? "anthropic"), model: rest.join(":") || agent?.model || "" };
  }, [choice, agent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("agent-preview", {
        body: {
          agent_key: key,
          messages: next,
          provider_override: selected.provider,
          model_override: selected.model,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages([...next, { role: "assistant", content: data?.message ?? "(kosong)" }]);
    } catch (err) {
      // Ambil pesan error asli dari body respons edge function (FunctionsHttpError)
      let msg = err instanceof Error ? err.message : "Gagal menghubungi agent.";
      const ctx = (err as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") {
        try {
          const body = await ctx.clone().json();
          if (body?.error) msg = String(body.error);
        } catch {
          /* biarkan pesan default */
        }
      }
      toast.error(msg, { duration: 8000 });
      setMessages(next);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const agentName = agent?.name ?? key.toUpperCase();

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col lg:h-[calc(100vh-4rem)]">
      {/* Bar atas */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/agents/$key"
            params={{ key }}
            className="grid h-8 w-8 place-items-center rounded-lg text-navy/60 hover:bg-white"
            aria-label="Kembali"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="font-display text-sm font-bold text-navy">Preview — {agentName}</p>
            <p className="text-xs opacity-55">
              {agent ? `${selected.model} · temp ${agent.temperature}` : "memuat…"}
            </p>
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
      </div>

      {/* Area percakapan */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-2">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[45vh] flex-col items-center justify-center text-center">
              <span
                className={`grid h-14 w-14 place-items-center rounded-2xl ${agent?.accent ?? "bg-navy text-cream"}`}
              >
                <Sparkles className="h-7 w-7" />
              </span>
              <h1 className="mt-5 font-display text-3xl font-bold text-navy">
                Halo, saya {agentName}.
              </h1>
              <p className="mt-2 max-w-md text-sm opacity-60">
                {agent?.description ??
                  "Kirim pesan untuk menguji perilaku agent sesuai setting AI Lab saat ini."}
              </p>
            </div>
          ) : (
            <div className="space-y-6 py-2">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-navy/[0.06] px-4 py-3 text-[15px] leading-relaxed text-navy">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex gap-3">
                    <span
                      className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${agent?.accent ?? "bg-navy text-cream"}`}
                    >
                      <Bot className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 whitespace-pre-wrap text-[15px] leading-relaxed text-navy/90">
                      {m.content}
                    </div>
                  </div>
                ),
              )}
              {busy ? (
                <div className="flex gap-3">
                  <span
                    className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${agent?.accent ?? "bg-navy text-cream"}`}
                  >
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

      {/* Input ala Claude */}
      <div className="mx-auto w-full max-w-3xl px-2 pb-2 pt-4">
        <div className="rounded-3xl border-2 border-navy/15 bg-white p-3 shadow-[0_2px_12px_rgba(11,27,46,0.06)] focus-within:border-navy/30">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={Math.min(6, Math.max(1, input.split("\n").length))}
            placeholder={`Tulis pesan untuk ${agentName}…`}
            className="max-h-40 w-full resize-none bg-transparent px-2 py-1 text-[15px] leading-relaxed outline-none placeholder:opacity-40"
          />
          <div className="flex items-center justify-between pt-1">
            <div className="relative inline-flex items-center">
              <select
                value={choice}
                onChange={(e) => setChoice(e.target.value)}
                aria-label="Pilih model"
                className="max-w-[240px] cursor-pointer appearance-none rounded-lg bg-transparent py-1 pl-2 pr-7 text-xs font-semibold text-navy/60 outline-none transition hover:bg-cream-deep hover:text-navy"
              >
                {modelChoices.length === 0 && agent ? (
                  <option value={`${agent.provider ?? "anthropic"}:${agent.model}`}>
                    {agent.model}
                  </option>
                ) : null}
                {modelChoices.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
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
          Preview memakai system prompt, model, dan temperature dari AI Lab. Jawaban AI bisa keliru.
        </p>
      </div>
    </div>
  );
}
