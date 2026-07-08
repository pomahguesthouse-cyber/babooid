import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Bot,
  BookOpen,
  ClipboardList,
  Eye,
  FileText,
  FolderPlus,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  User,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getKnowledgeFileUrl,
  useAiAgents,
  useAiProviders,
  useAiAgentTools,
  useAiKnowledge,
  useAiSops,
  useAiTools,
  useCreateAiKnowledge,
  useCreateAiKnowledgeFiles,
  useCreateAiSop,
  useDeleteAiKnowledge,
  useDeleteAiSop,
  useToggleAgentTool,
  useUpdateAiAgent,
  useUpdateAiSop,
  type AiAgent,
  type AiKnowledge,
  type AiKnowledgeSource,
  type AiSop,
} from "@/lib/ai-lab";

const statusBadge: Record<AiAgent["status"], string> = {
  draft: "bg-navy/10 text-navy",
  aktif: "bg-mint/25 text-mint-deep",
  nonaktif: "bg-coral/25 text-coral-deep",
};

function relTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const jam = Math.floor(diff / 3_600_000);
  if (jam < 1) return "baru saja";
  if (jam < 24) return `${jam} jam yang lalu`;
  const hari = Math.floor(jam / 24);
  if (hari === 1) return "Kemarin";
  if (hari < 7) return `${hari} hari yang lalu`;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function errMsg(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function PanelCard({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: typeof Bot;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border-2 border-navy/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy">
          <Icon className="h-5 w-5 text-mint-deep" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AgentDashboard({ agentKey }: { agentKey: string }) {
  const { data: agents, isLoading } = useAiAgents();
  const agent = agents?.find((a) => a.key === agentKey);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mint-deep" />
      </div>
    );
  }
  if (!agent) {
    return (
      <div className="rounded-2xl border-2 border-navy/10 bg-white p-8 text-center text-sm opacity-70">
        Agent “{agentKey}” tidak ditemukan. Pastikan migration sudah dijalankan.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AgentHeader agent={agent} />
      <div className="grid gap-6 xl:grid-cols-2">
        <DetailPanel agent={agent} />
        <KnowledgePanel agent={agent} />
        <ToolsPanel agent={agent} />
        <SopPanel agent={agent} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Header
// ---------------------------------------------------------------
function AgentHeader({ agent }: { agent: AiAgent }) {
  return (
    <section className="rounded-2xl border-2 border-navy/10 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start gap-6">
        <span className={`grid h-20 w-20 shrink-0 place-items-center rounded-2xl ${agent.accent}`}>
          <Bot className="h-10 w-10" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-extrabold text-navy">{agent.name}</h1>
            <Badge className={statusBadge[agent.status]}>{agent.status}</Badge>
          </div>
          <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-wide opacity-50">Key (slug)</dt>
              <dd className="font-semibold text-navy">{agent.key}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide opacity-50">Role</dt>
              <dd className="font-semibold text-navy">{agent.role || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide opacity-50">Model</dt>
              <dd className="font-semibold text-navy">{agent.model}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide opacity-50">Temperature</dt>
              <dd className="font-semibold text-navy">{agent.temperature}</dd>
            </div>
          </dl>
          {agent.description ? (
            <p className="mt-3 text-sm opacity-75">{agent.description}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// 1. Detail Agent
// ---------------------------------------------------------------
function DetailPanel({ agent }: { agent: AiAgent }) {
  const updateAgent = useUpdateAiAgent();
  const { data: providers } = useAiProviders();
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState<AiAgent["status"]>(agent.status);
  const [provider, setProvider] = useState(agent.provider ?? "anthropic");
  const [model, setModel] = useState(agent.model);
  const [tags, setTags] = useState<string[]>(agent.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [prompt, setPrompt] = useState(agent.system_prompt);

  const providerOptions = useMemo(
    () => (providers ?? []).filter((p) => p.enabled || p.key === (agent.provider ?? "anthropic")),
    [providers, agent.provider],
  );

  const modelOptions = useMemo(() => {
    const active = (providers ?? []).find((p) => p.key === provider);
    const list = (active?.models ?? "")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    if (model && !list.includes(model)) list.unshift(model);
    return list.length > 0 ? list : [agent.model];
  }, [providers, provider, model, agent.model]);

  useEffect(() => {
    setStatus(agent.status);
    setProvider(agent.provider ?? "anthropic");
    setModel(agent.model);
    setTags(agent.tags ?? []);
    setPrompt(agent.system_prompt);
  }, [agent]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const val = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement).value.trim();
    try {
      await updateAgent.mutateAsync({
        id: agent.id,
        name: val("name"),
        key: val("key"),
        role: val("role"),
        provider,
        model,
        temperature: Number(val("temperature") || "0.2"),
        description: val("description"),
        system_prompt: prompt,
        status,
        tags,
      });
      toast.success("Perubahan agent disimpan.");
      setEditMode(false);
    } catch (err) {
      toast.error(errMsg(err, "Gagal menyimpan."));
    }
  };

  const dis = !editMode;

  return (
    <PanelCard
      icon={User}
      title="1. Detail Agent"
      action={
        <label className="flex items-center gap-2 text-sm opacity-80">
          <Pencil className="h-3.5 w-3.5" /> Edit Mode
          <Switch checked={editMode} onCheckedChange={setEditMode} />
        </label>
      }
    >
      <form id="agent-detail-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Agent</Label>
            <Input id="name" name="name" defaultValue={agent.name} disabled={dis} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="key">Key (slug)</Label>
            <Input
              id="key"
              name="key"
              defaultValue={agent.key}
              disabled={dis}
              pattern="[a-z0-9-]{2,40}"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">Keahlian / Role</Label>
            <Input id="role" name="role" defaultValue={agent.role} disabled={dis} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Provider &amp; Model</Label>
            <Select
              value={provider}
              onValueChange={(v) => {
                setProvider(v);
                const first = (providers ?? [])
                  .find((p) => p.key === v)
                  ?.models.split(",")
                  .map((m) => m.trim())
                  .filter(Boolean)[0];
                const nextModel = first ?? model;
                if (first) setModel(first);
                updateAgent
                  .mutateAsync({ id: agent.id, provider: v, model: nextModel })
                  .then(() => toast.success(`Provider diganti ke ${v}.`))
                  .catch((err) => toast.error(errMsg(err, "Gagal mengganti provider.")));
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {providerOptions.map((p) => (
                  <SelectItem key={p.key} value={p.key}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={model}
              onValueChange={(v) => {
                setModel(v);
                updateAgent
                  .mutateAsync({ id: agent.id, model: v })
                  .then(() => toast.success(`Model diganti ke ${v}.`))
                  .catch((err) => toast.error(errMsg(err, "Gagal mengganti model.")));
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs opacity-50">
              Langsung tersimpan saat diganti. Daftar model diatur di{" "}
              <a href="/admin/settings" className="underline">
                Settings
              </a>
              .
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="temperature">Temperature</Label>
            <Input
              id="temperature"
              name="temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              defaultValue={agent.temperature}
              disabled={dis}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as AiAgent["status"])}
              disabled={dis}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={agent.description ?? ""}
              disabled={dis}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Metadata (opsional)</Label>
            <div className="flex min-h-[80px] flex-wrap content-start gap-2 rounded-xl border-2 border-navy/10 bg-cream/40 p-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full border border-navy/15 bg-white px-3 py-1 text-xs font-semibold text-navy"
                >
                  {t}
                  {editMode ? (
                    <button
                      type="button"
                      aria-label={`Hapus tag ${t}`}
                      onClick={() => setTags(tags.filter((x) => x !== t))}
                    >
                      <X className="h-3 w-3 opacity-60" />
                    </button>
                  ) : null}
                </span>
              ))}
              {editMode ? (
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  onBlur={addTag}
                  placeholder="+ Tambah tag"
                  className="h-7 w-28 rounded-full border border-dashed border-navy/25 bg-transparent px-3 text-xs outline-none"
                />
              ) : null}
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="system_prompt">System Prompt</Label>
            <span className="text-xs opacity-50">{prompt.length} / 4000</span>
          </div>
          <Textarea
            id="system_prompt"
            rows={6}
            value={prompt}
            maxLength={4000}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={dis}
            className="font-mono text-xs"
          />
        </div>
        {editMode ? (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateAgent.isPending}
              className="inline-flex items-center gap-2 rounded-full bg-sun px-5 py-2 text-sm font-bold text-navy-deep shadow-[0_4px_0_rgba(11,27,46,0.2)] transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {updateAgent.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Simpan Perubahan
            </button>
          </div>
        ) : null}
      </form>
    </PanelCard>
  );
}

// ---------------------------------------------------------------
// 2. Knowledge
// ---------------------------------------------------------------
const kategoriStyle = (k: string) => {
  const key = k.toLowerCase();
  if (key.includes("standar")) return "bg-mint/25 text-mint-deep";
  if (key.includes("template")) return "bg-sun/30 text-sun-deep";
  if (key.includes("simbol")) return "bg-navy/10 text-navy";
  return "bg-coral/20 text-coral-deep";
};

// Batas & tipe file yang diterima untuk upload knowledge dari lokal.
const MAX_FILE_MB = 20;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const ACCEPTED_EXT = [
  "pdf",
  "doc",
  "docx",
  "txt",
  "md",
  "csv",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "png",
  "jpg",
  "jpeg",
];
const ACCEPT_ATTR = ACCEPTED_EXT.map((e) => `.${e}`).join(",");

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Kembalikan pesan error jika file tidak valid, atau null jika lolos. */
function validateFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ACCEPTED_EXT.includes(ext)) return `Tipe .${ext} tidak didukung`;
  if (file.size > MAX_FILE_BYTES) return `Melebihi ${MAX_FILE_MB}MB`;
  return null;
}

function KnowledgePanel({ agent }: { agent: AiAgent }) {
  const { data: items, isLoading } = useAiKnowledge(agent.id);
  const createKnowledge = useCreateAiKnowledge();
  const createKnowledgeFiles = useCreateAiKnowledgeFiles();
  const deleteKnowledge = useDeleteAiKnowledge();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [sourceType, setSourceType] = useState<AiKnowledgeSource>("teks");
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const relKey = (f: File) =>
    (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name;

  const addFiles = (incoming: FileList | File[]) => {
    const accepted: File[] = [];
    let skipped = 0;
    for (const f of Array.from(incoming)) {
      if (validateFile(f)) {
        skipped++;
        continue;
      }
      accepted.push(f);
    }
    if (skipped > 0) toast.error(`${skipped} file dilewati (tipe/ukuran tidak sesuai).`);
    if (accepted.length === 0) return;
    setFiles((prev) => {
      const seen = new Set(prev.map((p) => `${relKey(p)}-${p.size}`));
      return [...prev, ...accepted.filter((f) => !seen.has(`${relKey(f)}-${f.size}`))];
    });
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const filtered = useMemo(
    () => (items ?? []).filter((k) => k.title.toLowerCase().includes(q.toLowerCase())),
    [items, q],
  );

  const view = async (k: AiKnowledge) => {
    if (k.source_type === "url" && k.url) window.open(k.url, "_blank", "noopener");
    else if (k.source_type === "file" && k.storage_path) {
      try {
        window.open(await getKnowledgeFileUrl(k.storage_path), "_blank", "noopener");
      } catch (err) {
        toast.error(errMsg(err, "Gagal membuka file."));
      }
    } else if (k.content) {
      toast.info(k.content.slice(0, 300));
    }
  };

  const resetForm = () => {
    setFiles([]);
    setProgress(null);
    setSourceType("teks");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const val = (n: string) =>
      (form.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement | null)?.value.trim() ??
      "";
    const kategori = val("kategori") || "Referensi";
    try {
      if (sourceType === "file") {
        if (files.length === 0) {
          toast.error("Pilih minimal satu file.");
          return;
        }
        setProgress({ done: 0, total: files.length });
        await createKnowledgeFiles.mutateAsync({
          agent_id: agent.id,
          files,
          tags: [kategori],
          onProgress: (done, total) => setProgress({ done, total }),
        });
        toast.success(`${files.length} file diupload.`);
      } else {
        await createKnowledge.mutateAsync({
          agent_id: agent.id,
          title: val("title"),
          source_type: sourceType,
          content: sourceType === "teks" ? val("content") : undefined,
          url: sourceType === "url" ? val("url") : undefined,
          tags: [kategori],
        });
        toast.success("Knowledge ditambahkan.");
      }
      setOpen(false);
      resetForm();
    } catch (err) {
      toast.error(errMsg(err, "Gagal menambah knowledge."));
    } finally {
      setProgress(null);
    }
  };

  return (
    <PanelCard
      icon={BookOpen}
      title="2. Knowledge"
      action={
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-sun px-4 py-1.5 text-xs font-bold text-navy-deep shadow-[0_3px_0_rgba(11,27,46,0.2)] transition hover:-translate-y-0.5"
        >
          <Plus className="h-3.5 w-3.5" /> Tambah Knowledge
        </button>
      }
    >
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-40" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari knowledge..."
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-mint-deep" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm opacity-60">Belum ada knowledge.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy/10 text-left text-xs uppercase tracking-wide opacity-50">
                <th className="py-2 pr-3 font-semibold">Judul Knowledge</th>
                <th className="py-2 pr-3 font-semibold">Kategori</th>
                <th className="py-2 pr-3 font-semibold">Terakhir Diupdate</th>
                <th className="py-2 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((k) => (
                <tr key={k.id} className="border-b border-navy/5">
                  <td className="py-2.5 pr-3 font-medium text-navy">{k.title}</td>
                  <td className="py-2.5 pr-3">
                    <Badge className={kategoriStyle(k.tags[0] ?? "")}>{k.tags[0] ?? "Umum"}</Badge>
                  </td>
                  <td className="py-2.5 pr-3 text-xs opacity-70">{relTime(k.updated_at)}</td>
                  <td className="py-2.5">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        aria-label="Lihat"
                        onClick={() => view(k)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-navy/60 hover:bg-cream-deep"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Hapus"
                        onClick={() =>
                          deleteKnowledge
                            .mutateAsync(k)
                            .then(() => toast.success("Knowledge dihapus."))
                            .catch((err) => toast.error(errMsg(err, "Gagal menghapus.")))
                        }
                        className="grid h-7 w-7 place-items-center rounded-lg text-coral-deep/70 hover:bg-coral/15"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs opacity-50">
            Menampilkan 1–{filtered.length} dari {items?.length ?? 0} data
          </p>
        </div>
      )}

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Knowledge — {agent.name}</DialogTitle>
            <DialogDescription>Teks, tautan, atau file referensi.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {sourceType !== "file" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="k-title">Judul</Label>
                  <Input id="k-title" name="title" required />
                </div>
              ) : null}
              <div className="space-y-1.5">
                <Label htmlFor="kategori">Kategori</Label>
                <Input
                  id="kategori"
                  name="kategori"
                  placeholder="Standar / Template / Simbol / Referensi"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tipe sumber</Label>
              <Select
                value={sourceType}
                onValueChange={(v) => setSourceType(v as AiKnowledgeSource)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teks">Teks</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {sourceType === "teks" ? (
              <div className="space-y-1.5">
                <Label htmlFor="k-content">Isi</Label>
                <Textarea id="k-content" name="content" rows={5} required />
              </div>
            ) : null}
            {sourceType === "url" ? (
              <div className="space-y-1.5">
                <Label htmlFor="k-url">URL</Label>
                <Input id="k-url" name="url" type="url" placeholder="https://" required />
              </div>
            ) : null}
            {sourceType === "file" ? (
              <div className="space-y-2">
                <Label>File dari komputer</Label>
                <label
                  htmlFor="k-file"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
                  }}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
                    dragActive
                      ? "border-mint-deep bg-mint/10"
                      : "border-navy/20 hover:border-mint-deep hover:bg-cream-deep/40"
                  }`}
                >
                  <UploadCloud className="h-8 w-8 text-mint-deep" />
                  <span className="text-sm font-semibold text-navy">
                    Tarik &amp; letakkan file di sini, atau klik untuk memilih
                  </span>
                  <span className="text-xs opacity-60">
                    {ACCEPTED_EXT.join(", ")} — maks {MAX_FILE_MB}MB per file
                  </span>
                  <input
                    id="k-file"
                    type="file"
                    multiple
                    accept={ACCEPT_ATTR}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>

                <div className="flex items-center justify-center gap-2 text-xs">
                  <span className="opacity-50">atau</span>
                  <button
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 px-3 py-1.5 font-semibold text-navy transition hover:border-mint-deep hover:bg-cream-deep/40"
                  >
                    <FolderPlus className="h-3.5 w-3.5" /> Pilih 1 folder (semua isi)
                  </button>
                  <input
                    ref={folderInputRef}
                    type="file"
                    multiple
                    // @ts-expect-error atribut non-standar untuk memilih folder
                    webkitdirectory=""
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>

                {files.length > 0 ? (
                  <ul className="space-y-1.5">
                    {files.map((f, i) => (
                      <li
                        key={`${f.name}-${f.size}-${i}`}
                        className="flex items-center gap-2 rounded-xl bg-cream-deep/50 px-3 py-2 text-sm"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-navy/60" />
                        <span className="min-w-0 flex-1 truncate font-medium text-navy">
                          {(f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name}
                        </span>
                        <span className="shrink-0 text-xs opacity-60">{formatBytes(f.size)}</span>
                        <button
                          type="button"
                          aria-label="Hapus file"
                          onClick={() => removeFile(i)}
                          disabled={createKnowledgeFiles.isPending}
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-lg text-coral-deep/70 hover:bg-coral/15 disabled:opacity-40"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {progress ? (
                  <div className="space-y-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-navy/10">
                      <div
                        className="h-full rounded-full bg-mint-deep transition-all"
                        style={{ width: `${(progress.done / progress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs opacity-60">
                      Mengupload {progress.done}/{progress.total} file...
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
            <DialogFooter>
              <button
                type="submit"
                disabled={createKnowledge.isPending || createKnowledgeFiles.isPending}
                className="inline-flex items-center gap-2 rounded-full bg-sun px-5 py-2 text-sm font-bold text-navy-deep shadow-[0_4px_0_rgba(11,27,46,0.2)] disabled:opacity-60"
              >
                {createKnowledge.isPending || createKnowledgeFiles.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {sourceType === "file" && files.length > 0 ? `Upload ${files.length} file` : "Simpan"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PanelCard>
  );
}

// ---------------------------------------------------------------
// 3. Tools
// ---------------------------------------------------------------
function ToolsPanel({ agent }: { agent: AiAgent }) {
  const { data: tools, isLoading } = useAiTools();
  const { data: agentTools } = useAiAgentTools();
  const toggle = useToggleAgentTool();

  const attached = (toolId: string) =>
    (agentTools ?? []).some((at) => at.agent_id === agent.id && at.tool_id === toolId);

  return (
    <PanelCard icon={Wrench} title="3. Tools">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-mint-deep" />
        </div>
      ) : (tools ?? []).length === 0 ? (
        <p className="py-8 text-center text-sm opacity-60">
          Belum ada tool. Tambahkan lewat menu Tools.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(tools ?? []).map((t) => (
            <div
              key={t.id}
              className="flex items-start justify-between gap-3 rounded-xl border-2 border-navy/10 bg-cream/40 p-4"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-bold text-navy">
                  <Wrench className="h-4 w-4 text-mint-deep" />
                  {t.name}
                </p>
                {t.description ? (
                  <p className="mt-1 line-clamp-2 text-xs opacity-70">{t.description}</p>
                ) : null}
              </div>
              <Switch
                checked={attached(t.id)}
                onCheckedChange={(checked) =>
                  toggle
                    .mutateAsync({ agent_id: agent.id, tool_id: t.id, attach: checked })
                    .catch((err) => toast.error(errMsg(err, "Gagal mengubah tool.")))
                }
              />
            </div>
          ))}
        </div>
      )}
    </PanelCard>
  );
}

// ---------------------------------------------------------------
// 4. SOP
// ---------------------------------------------------------------
function SopPanel({ agent }: { agent: AiAgent }) {
  const { data: sops, isLoading } = useAiSops(agent.id);
  const createSop = useCreateAiSop();
  const updateSop = useUpdateAiSop();
  const deleteSop = useDeleteAiSop();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AiSop | null>(null);

  const selected = (sops ?? []).find((s) => s.id === selectedId) ?? (sops ?? [])[0] ?? null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const val = (n: string) =>
      (form.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement).value.trim();
    const steps = val("steps")
      .split("\n")
      .map((s) => s.replace(/^\d+[.)]\s*/, "").trim())
      .filter(Boolean);
    try {
      if (editing) {
        await updateSop.mutateAsync({
          id: editing.id,
          title: val("title"),
          purpose: val("purpose"),
          steps,
          output: val("output"),
        });
        toast.success("SOP diperbarui.");
      } else {
        await createSop.mutateAsync({
          agent_id: agent.id,
          title: val("title"),
          purpose: val("purpose"),
          steps,
          output: val("output"),
          sort: (sops?.length ?? 0) + 1,
        });
        toast.success("SOP ditambahkan.");
      }
      setOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(errMsg(err, "Gagal menyimpan SOP."));
    }
  };

  return (
    <PanelCard
      icon={ClipboardList}
      title="4. SOP"
      action={
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-sun px-4 py-1.5 text-xs font-bold text-navy-deep shadow-[0_3px_0_rgba(11,27,46,0.2)] transition hover:-translate-y-0.5"
        >
          <Plus className="h-3.5 w-3.5" /> Tambah SOP
        </button>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-mint-deep" />
        </div>
      ) : (sops ?? []).length === 0 ? (
        <p className="py-8 text-center text-sm opacity-60">Belum ada SOP untuk agent ini.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <div className="space-y-2">
            {(sops ?? []).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                className={`w-full rounded-xl border-2 px-3 py-2 text-left text-xs font-semibold transition ${
                  selected?.id === s.id
                    ? "border-sun bg-sun/20 text-navy"
                    : "border-navy/10 bg-cream/40 text-navy/70 hover:border-navy/25"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
          {selected ? (
            <div className="rounded-xl border-2 border-navy/10 bg-cream/30 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-sm font-bold text-navy">{selected.title}</h3>
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Edit SOP"
                    onClick={() => {
                      setEditing(selected);
                      setOpen(true);
                    }}
                    className="grid h-7 w-7 place-items-center rounded-lg text-navy/60 hover:bg-cream-deep"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Hapus SOP"
                    onClick={() =>
                      deleteSop
                        .mutateAsync(selected.id)
                        .then(() => {
                          setSelectedId(null);
                          toast.success("SOP dihapus.");
                        })
                        .catch((err) => toast.error(errMsg(err, "Gagal menghapus SOP.")))
                    }
                    className="grid h-7 w-7 place-items-center rounded-lg text-coral-deep/70 hover:bg-coral/15"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {selected.purpose ? (
                <>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wide opacity-50">
                    Tujuan
                  </p>
                  <p className="mt-1 text-sm opacity-85">{selected.purpose}</p>
                </>
              ) : null}
              {selected.steps.length > 0 ? (
                <>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wide opacity-50">
                    Langkah-langkah
                  </p>
                  <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm opacity-85">
                    {selected.steps.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ol>
                </>
              ) : null}
              {selected.output ? (
                <>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wide opacity-50">
                    Output
                  </p>
                  <p className="mt-1 text-sm opacity-85">{selected.output}</p>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit SOP" : "Tambah SOP"} — {agent.name}
            </DialogTitle>
            <DialogDescription>Satu langkah per baris pada kolom langkah.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="s-title">Judul</Label>
              <Input id="s-title" name="title" defaultValue={editing?.title ?? ""} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-purpose">Tujuan</Label>
              <Textarea
                id="s-purpose"
                name="purpose"
                rows={2}
                defaultValue={editing?.purpose ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-steps">Langkah-langkah (satu per baris)</Label>
              <Textarea
                id="s-steps"
                name="steps"
                rows={6}
                defaultValue={(editing?.steps ?? []).join("\n")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-output">Output</Label>
              <Input id="s-output" name="output" defaultValue={editing?.output ?? ""} />
            </div>
            <DialogFooter>
              <button
                type="submit"
                disabled={createSop.isPending || updateSop.isPending}
                className="inline-flex items-center gap-2 rounded-full bg-sun px-5 py-2 text-sm font-bold text-navy-deep shadow-[0_4px_0_rgba(11,27,46,0.2)] disabled:opacity-60"
              >
                {createSop.isPending || updateSop.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Simpan
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PanelCard>
  );
}
