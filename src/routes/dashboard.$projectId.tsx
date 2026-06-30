import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Upload,
  File as FileIcon,
  Trash2,
  Download,
  Loader2,
  SendHorizontal,
  Sparkles,
} from "lucide-react";
import { CartoonButton } from "@/components/cartoon-ui";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AGENTS, getAgent, SUB_AGENTS } from "@/lib/agents";
import {
  useProject,
  useProjectFiles,
  useUploadFile,
  useDeleteFile,
  useMessages,
  useSendToMandor,
  getFileUrl,
  formatBytes,
} from "@/lib/projects";
import type { ProjectFile } from "@/lib/types";

export const Route = createFileRoute("/dashboard/$projectId")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const { data: project, isLoading } = useProject(projectId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-mint-deep" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card-pop p-8 text-center">
        <p className="font-display text-lg font-bold text-navy">Proyek tidak ditemukan.</p>
        <Link to="/dashboard" className="mt-3 inline-block text-sm font-bold text-mint-deep">
          ← Kembali ke daftar proyek
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-navy/70 hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" />
        Semua proyek
      </Link>

      <div className="mt-3">
        <h1 className="font-display text-3xl font-extrabold text-navy">{project.name}</h1>
        {project.description ? (
          <p className="mt-1 max-w-2xl text-sm opacity-75">{project.description}</p>
        ) : null}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <FilesPanel projectId={projectId} />
        <ChatPanel projectId={projectId} />
      </div>
    </div>
  );
}

// ---------------- FILES ----------------
function FilesPanel({ projectId }: { projectId: string }) {
  const { data: files, isLoading } = useProjectFiles(projectId);
  const upload = useUploadFile(projectId);
  const remove = useDeleteFile(projectId);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || !list.length) return;
    for (const file of Array.from(list)) {
      try {
        await upload.mutateAsync(file);
      } catch (err) {
        toast.error(`${file.name}: ${err instanceof Error ? err.message : "gagal diunggah"}`);
      }
    }
    toast.success("File diunggah.");
    if (inputRef.current) inputRef.current.value = "";
  };

  const openFile = async (f: ProjectFile) => {
    const url = await getFileUrl(f.storage_path);
    if (url) window.open(url, "_blank");
    else toast.error("Gagal membuka file.");
  };

  return (
    <section className="card-pop flex flex-col p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-extrabold text-navy">File pendukung</h2>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-navy bg-cream px-3 py-1.5 text-sm font-bold text-navy hover:bg-cream-deep disabled:opacity-60"
        >
          {upload.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Unggah
        </button>
        <input ref={inputRef} type="file" multiple hidden onChange={onPick} />
      </div>

      <div className="mt-4 flex-1">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-mint-deep" />
          </div>
        ) : !files || files.length === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-navy/25 px-4 py-10 text-center hover:border-mint-deep hover:bg-cream-deep/40"
          >
            <Upload className="h-6 w-6 text-mint-deep" />
            <span className="text-sm opacity-70">
              Seret atau klik untuk mengunggah dokumen, gambar, DWG, PDF…
            </span>
          </button>
        ) : (
          <ul className="space-y-2">
            {files.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-3 rounded-xl border-2 border-navy/10 bg-cream p-2.5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cream-deep">
                  <FileIcon className="h-4 w-4 text-navy/70" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy">{f.name}</p>
                  <p className="text-xs opacity-60">{formatBytes(f.size_bytes)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => openFile(f)}
                  aria-label="Buka"
                  className="grid h-8 w-8 place-items-center rounded-lg text-navy/60 hover:bg-cream-deep hover:text-navy"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove.mutate(f)}
                  aria-label="Hapus"
                  className="grid h-8 w-8 place-items-center rounded-lg text-coral-deep/70 hover:bg-coral/15 hover:text-coral-deep"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

// ---------------- CHAT ----------------
function ChatPanel({ projectId }: { projectId: string }) {
  const { data: messages, isLoading } = useMessages(projectId);
  const send = useSendToMandor(projectId);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, send.isPending]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || send.isPending) return;
    setText("");
    try {
      await send.mutateAsync(value);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Baboo Mandor gagal merespons.");
      setText(value);
    }
  };

  const Mandor = AGENTS.mandor;

  return (
    <section className="card-pop flex h-[560px] flex-col p-0">
      <header className="flex items-center gap-3 border-b-2 border-navy/10 p-4">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${Mandor.accent}`}>
          <Mandor.icon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-base font-extrabold leading-tight text-navy">
            {Mandor.name}
          </p>
          <p className="text-xs opacity-65">
            Mengoordinasi {SUB_AGENTS.map((a) => a.name.replace("Baboo ", "")).join(", ")}
          </p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-mint-deep" />
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cream-deep">
              <Sparkles className="h-6 w-6 text-mint-deep" />
            </span>
            <p className="max-w-xs text-sm opacity-70">
              Ceritakan kebutuhan proyek Anda. Baboo Mandor akan mengarahkannya ke spesialis yang
              tepat — Civil, CAD, atau Architect.
            </p>
          </div>
        ) : (
          messages.map((m) => <Bubble key={m.id} role={m.role} agent={m.agent} content={m.content} />)
        )}
        {send.isPending ? (
          <div className="flex items-center gap-2 text-sm opacity-60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Baboo Mandor sedang berpikir…
          </div>
        ) : null}
      </div>

      <form onSubmit={submit} className="border-t-2 border-navy/10 p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit(e);
              }
            }}
            rows={1}
            placeholder="Tulis instruksi untuk Baboo Mandor…"
            className="max-h-32 min-h-[44px] resize-none"
          />
          <CartoonButton type="submit" disabled={send.isPending || !text.trim()} className="px-4 py-3">
            <SendHorizontal className="h-4 w-4" />
          </CartoonButton>
        </div>
      </form>
    </section>
  );
}

function Bubble({
  role,
  agent,
  content,
}: {
  role: "user" | "assistant";
  agent: string;
  content: string;
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-navy px-4 py-2.5 text-sm text-cream">
          {content}
        </div>
      </div>
    );
  }
  const a = getAgent(agent);
  const Icon = a.icon;
  return (
    <div className="flex gap-2.5">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${a.accent}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="max-w-[80%]">
        <p className="mb-1 text-xs font-bold text-navy/70">{a.name}</p>
        <div className="whitespace-pre-wrap rounded-2xl rounded-tl-sm border-2 border-navy/10 bg-cream px-4 py-2.5 text-sm text-navy">
          {content}
        </div>
      </div>
    </div>
  );
}
