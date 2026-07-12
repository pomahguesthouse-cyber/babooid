import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
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
  ChevronUp,
  Download,
  File as FileIcon,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Paperclip,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import {
  useCreateProject,
  useDeleteFile,
  useProjectFiles,
  useUpdateProject,
  getFileUrl,
  formatBytes,
} from "@/lib/projects";
import type { ProjectFile } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  file: File;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const PROJECT_FILES_BUCKET = "project-files";

const demoAgents = [
  {
    key: "mandor",
    name: "Baboo Mandor",
    role: "Orchestrator proyek",
    description:
      "Mengoordinasi kebutuhan user dan meneruskan pekerjaan ke agent yang paling tepat.",
    accent: "bg-navy text-cream",
    prompt: "Saya ingin membuat workflow agent untuk bisnis saya. Mulai dari mana?",
  },
  {
    key: "civil",
    name: "Baboo Civil",
    role: "Insinyur Sipil",
    description:
      "Membantu analisis struktur, pondasi, material, beban, dan kebutuhan teknis konstruksi.",
    accent: "bg-sun text-navy-deep",
    prompt: "Analisa konsep struktur rumah 2 lantai rangka baja dengan plat bondek.",
  },
  {
    key: "cad",
    name: "Baboo CAD",
    role: "Drafter Teknik",
    description:
      "Membantu membuat instruksi gambar kerja, denah, detail, potongan, dan konsep CAD.",
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

/** Unggah file langsung (bukan lewat hook) supaya bisa dipanggil segera setelah proyek dibuat di render yang sama. */
async function uploadProjectFile(projectId: string, file: File) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("Belum masuk.");

  const safeName = file.name.replace(/[^\w.-]+/g, "_");
  const path = `${userId}/${projectId}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(PROJECT_FILES_BUCKET)
    .upload(path, file, { upsert: false });
  if (uploadError) throw uploadError;

  const { error } = await supabase.from("project_files").insert({
    project_id: projectId,
    user_id: userId,
    name: file.name,
    storage_path: path,
    size_bytes: file.size,
    mime_type: file.type || null,
  });
  if (error) throw error;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function fileRowIcon(mimeType: string | null) {
  if (mimeType === "application/pdf") return FileText;
  if (mimeType?.startsWith("image/")) return ImageIcon;
  return FileIcon;
}

// ---------------- SIDEBAR PROYEK (kanan) ----------------
type ProjectSidebarProps = {
  projectName: string;
  onProjectNameChange: (value: string) => void;
  onProjectNameBlur: () => void;
  projectLocation: string;
  onProjectLocationChange: (value: string) => void;
  onProjectLocationBlur: () => void;
  ownerName: string;
  onOwnerNameChange: (value: string) => void;
  onOwnerNameBlur: () => void;
  files: ProjectFile[] | undefined;
  filesLoading: boolean;
  onAddFilesClick: () => void;
  onOpenFile: (file: ProjectFile) => void;
  onDeleteFile: (file: ProjectFile) => void;
  deletingFileId?: string;
};

function ProjectSidebar({
  projectName,
  onProjectNameChange,
  onProjectNameBlur,
  projectLocation,
  onProjectLocationChange,
  onProjectLocationBlur,
  ownerName,
  onOwnerNameChange,
  onOwnerNameBlur,
  files,
  filesLoading,
  onAddFilesClick,
  onOpenFile,
  onDeleteFile,
  deletingFileId,
}: ProjectSidebarProps) {
  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4">
      <section>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-navy/45">Detail Proyek</p>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-navy/60">Nama Proyek</span>
            <input
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              onBlur={onProjectNameBlur}
              placeholder="Contoh: Rumah 2 Lantai — Jl. Mawar"
              className="w-full rounded-xl border border-navy/15 bg-cream-deep/40 px-3 py-2 text-sm text-navy outline-none focus:border-mint-deep"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-navy/60">Lokasi</span>
            <input
              value={projectLocation}
              onChange={(e) => onProjectLocationChange(e.target.value)}
              onBlur={onProjectLocationBlur}
              placeholder="Contoh: Bandung, Jawa Barat"
              className="w-full rounded-xl border border-navy/15 bg-cream-deep/40 px-3 py-2 text-sm text-navy outline-none focus:border-mint-deep"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-navy/60">Owner</span>
            <input
              value={ownerName}
              onChange={(e) => onOwnerNameChange(e.target.value)}
              onBlur={onOwnerNameBlur}
              placeholder="Nama pemilik proyek"
              className="w-full rounded-xl border border-navy/15 bg-cream-deep/40 px-3 py-2 text-sm text-navy outline-none focus:border-mint-deep"
            />
          </label>
        </div>
      </section>

      <section className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-navy/45">File Proyek</p>
          <button
            type="button"
            onClick={onAddFilesClick}
            className="inline-flex items-center gap-1 rounded-full border border-navy/15 px-2.5 py-1 text-xs font-bold text-navy/70 transition hover:border-mint-deep hover:text-navy"
          >
            <Upload className="h-3 w-3" /> Tambah
          </button>
        </div>

        {filesLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-mint-deep" />
          </div>
        ) : !files || files.length === 0 ? (
          <button
            type="button"
            onClick={onAddFilesClick}
            className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-navy/15 px-3 py-6 text-center transition hover:border-mint-deep hover:bg-cream-deep/40"
          >
            <FolderOpen className="h-5 w-5 text-navy/30" />
            <span className="text-xs text-navy/45">
              Belum ada file. Unggah dokumen proyek di sini.
            </span>
          </button>
        ) : (
          <ul className="space-y-1.5">
            {files.map((f) => {
              const Icon = fileRowIcon(f.mime_type);
              const deleting = deletingFileId === f.id;
              return (
                <li
                  key={f.id}
                  className="flex items-center gap-2 rounded-xl border border-navy/10 bg-cream-deep/30 p-2"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white">
                    <Icon className="h-3.5 w-3.5 text-navy/60" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-navy">{f.name}</p>
                    <p className="text-[11px] text-navy/45">{formatBytes(f.size_bytes)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenFile(f)}
                    aria-label="Buka file"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-navy/40 hover:bg-white hover:text-navy"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteFile(f)}
                    disabled={deleting}
                    aria-label="Hapus file"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-coral-deep/60 hover:bg-coral/15 hover:text-coral-deep disabled:opacity-40"
                  >
                    {deleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function DemoAgentPage() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const qc = useQueryClient();

  const [agentKey, setAgentKey] = useState<DemoAgentKey>("cad");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [attachment, setAttachment] = useState<DemoAttachment | null>(null);
  const [dragging, setDragging] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const ownerTouchedRef = useRef(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const projectFileInputRef = useRef<HTMLInputElement | null>(null);
  const dragDepthRef = useRef(0);

  const agent = useMemo(
    () => demoAgents.find((item) => item.key === agentKey) ?? demoAgents[0],
    [agentKey],
  );

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { data: projectFiles, isLoading: filesLoading } = useProjectFiles(projectId ?? "");
  const deleteFile = useDeleteFile(projectId ?? "");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    return () => {
      if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    };
  }, [attachment]);

  // Isi Owner otomatis dari akun begitu user masuk, kecuali sudah diubah manual.
  useEffect(() => {
    if (!user || ownerTouchedRef.current || ownerName) return;
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const displayName =
      (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.name === "string" && meta.name) ||
      user.email ||
      "";
    if (displayName) setOwnerName(displayName);
  }, [user, ownerName]);

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

  function requireAuth() {
    if (!user) {
      setGateOpen(true);
      return false;
    }
    return true;
  }

  async function ensureProject(): Promise<string> {
    if (projectId) return projectId;
    const fallbackName = `Demo — ${agent.name} — ${new Date().toLocaleDateString("id-ID")}`;
    const name = projectName.trim() || fallbackName;
    const created = await createProject.mutateAsync({
      name,
      location: projectLocation.trim() || undefined,
      owner_name: ownerName.trim() || undefined,
    });
    setProjectId(created.id);
    if (!projectName.trim()) setProjectName(name);
    return created.id;
  }

  function saveProjectField(patch: {
    name?: string;
    location?: string | null;
    owner_name?: string | null;
  }) {
    if (!projectId) return;
    updateProject.mutate({ id: projectId, ...patch });
  }

  async function persistAttachment(att: DemoAttachment) {
    try {
      const pid = await ensureProject();
      await uploadProjectFile(pid, att.file);
      qc.invalidateQueries({ queryKey: ["files", pid] });
    } catch {
      // lampiran tetap terkirim ke agent walau gagal disalin ke daftar file proyek
    }
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
        file,
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

  async function onProjectFilesPick(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    if (!requireAuth()) return;

    try {
      const pid = await ensureProject();
      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name}: ukuran maksimal 5 MB.`);
          continue;
        }
        await uploadProjectFile(pid, file);
      }
      qc.invalidateQueries({ queryKey: ["files", pid] });
      toast.success("File proyek diunggah.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengunggah file.");
    }
  }

  async function openProjectFile(file: ProjectFile) {
    const url = await getFileUrl(file.storage_path);
    if (url) window.open(url, "_blank");
    else toast.error("Gagal membuka file.");
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
    if (!requireAuth()) return;

    const text = typedText || "Analisis lampiran ini dan jelaskan temuan utamanya.";
    const summary = attachment
      ? { name: attachment.name, mimeType: attachment.mimeType, size: attachment.size }
      : undefined;
    const next: ChatMessage[] = [...messages, { role: "user", content: text, attachment: summary }];
    setMessages(next);
    setInput("");
    setBusy(true);

    const sentAttachment = attachment;

    try {
      const { data, error } = await supabase.functions.invoke("agent-demo", {
        body: {
          agent_key: agentKey,
          messages: next.map(({ role, content }) => ({ role, content })),
          attachment: sentAttachment
            ? {
                name: sentAttachment.name,
                mime_type: sentAttachment.mimeType,
                size: sentAttachment.size,
                data: sentAttachment.data,
              }
            : null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setMessages([...next, { role: "assistant", content: data?.message ?? "(kosong)" }]);
      if (sentAttachment) void persistAttachment(sentAttachment);
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

  async function handleGoogleGate() {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setGoogleLoading(false);
      toast.error(err instanceof Error ? err.message : "Gagal masuk dengan Google.");
    }
  }

  const displayName = ownerName || user?.email || "Tamu";
  const initial = (ownerName || user?.email || "?").trim().charAt(0).toUpperCase() || "?";
  const deletingFileId = deleteFile.isPending
    ? (deleteFile.variables as ProjectFile | undefined)?.id
    : undefined;

  const sidebarProps: ProjectSidebarProps = {
    projectName,
    onProjectNameChange: setProjectName,
    onProjectNameBlur: () => {
      if (projectName.trim()) saveProjectField({ name: projectName.trim() });
    },
    projectLocation,
    onProjectLocationChange: setProjectLocation,
    onProjectLocationBlur: () => saveProjectField({ location: projectLocation.trim() || null }),
    ownerName,
    onOwnerNameChange: (v) => {
      ownerTouchedRef.current = true;
      setOwnerName(v);
    },
    onOwnerNameBlur: () => saveProjectField({ owner_name: ownerName.trim() || null }),
    files: projectFiles,
    filesLoading,
    onAddFilesClick: () => {
      if (!requireAuth()) return;
      projectFileInputRef.current?.click();
    },
    onOpenFile: (f) => void openProjectFile(f),
    onDeleteFile: (f) => deleteFile.mutate(f),
    deletingFileId,
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-cream-deep text-navy">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={onFileInputChange}
        className="hidden"
      />
      <input
        ref={projectFileInputRef}
        type="file"
        multiple
        onChange={onProjectFilesPick}
        className="hidden"
      />

      {/* Kolom tengah — chat */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b-2 border-navy/10 bg-cream px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex shrink-0 items-center" aria-label="Baboo.id">
              <span className="flex h-9 items-center rounded-full bg-navy px-3 py-1.5 shadow-[0_3px_0_rgba(11,27,46,0.18)]">
                <img
                  src="/img/logo_trans.png"
                  alt="Baboo.id"
                  className="h-5 w-auto max-w-[100px] object-contain"
                />
              </span>
            </Link>

            <div className="flex min-w-0 flex-1 items-center justify-center gap-3">
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${agent.accent}`}
              >
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="hidden min-w-0 sm:block">
                <h1 className="truncate font-display text-sm font-extrabold text-navy">
                  {agent.name}
                </h1>
                <p className="truncate text-xs text-navy/50">{agent.role}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {messages.length > 0 || attachment ? (
                <button
                  type="button"
                  onClick={resetConversation}
                  className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy/65 transition hover:border-navy/30 hover:text-navy"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Mulai ulang</span>
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Buka detail proyek"
                className="grid h-8 w-8 place-items-center rounded-full border border-navy/15 bg-white text-navy/60 hover:border-navy/30 hover:text-navy lg:hidden"
              >
                <FolderOpen className="h-4 w-4" />
              </button>
            </div>
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
                    onClick={() => (requireAuth() ? fileInputRef.current?.click() : undefined)}
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
            {user ? (
              <>
                <div
                  onDragEnter={onDragEnter}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={`relative rounded-2xl border-2 bg-white p-2 shadow-[0_2px_12px_rgba(11,27,46,0.05)] transition ${
                    dragging
                      ? "border-mint-deep bg-mint/10"
                      : "border-navy/15 focus-within:border-navy/30"
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
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-navy/15 bg-cream-deep/50 px-4 py-6 text-center">
                <Lock className="h-5 w-5 text-navy/40" />
                <p className="text-sm font-bold text-navy">
                  Daftar akun Baboo.id gratis untuk mulai chat
                </p>
                <p className="max-w-sm text-xs text-navy/50">
                  Percakapan dan file yang kamu unggah akan tersimpan di proyekmu.
                </p>
                <button
                  type="button"
                  onClick={() => setGateOpen(true)}
                  className="mt-1 rounded-full bg-navy px-4 py-2 text-sm font-bold text-cream transition hover:bg-navy/85"
                >
                  Daftar / Masuk
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar kanan — desktop */}
      <aside className="hidden w-[320px] shrink-0 border-l-2 border-navy/10 bg-white lg:block">
        <ProjectSidebar {...sidebarProps} />
      </aside>

      {/* Sidebar kanan — drawer mobile */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[320px] max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b-2 border-navy/10 p-4">
              <p className="font-display text-sm font-extrabold text-navy">Detail Proyek</p>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Tutup"
                className="grid h-8 w-8 place-items-center rounded-lg text-navy/50 hover:bg-cream-deep hover:text-navy"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <ProjectSidebar {...sidebarProps} />
            </div>
          </div>
        </div>
      ) : null}

      {/* Pengaturan akun — pojok kiri bawah */}
      <div className="fixed bottom-4 left-4 z-40">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-2xl border-2 border-navy/15 bg-white px-3 py-2 shadow-[0_4px_0_rgba(11,27,46,0.08)] transition hover:border-navy/30"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-cream">
                {initial}
              </span>
              <span className="hidden max-w-[140px] text-left sm:block">
                <span className="block truncate text-xs font-bold leading-tight text-navy">
                  {displayName}
                </span>
                <span className="block text-[11px] leading-tight text-navy/45">
                  {user ? "Akun Baboo.id" : "Tamu"}
                </span>
              </span>
              <ChevronUp className="h-3.5 w-3.5 shrink-0 text-navy/35" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            {user ? (
              <>
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => void signOut()}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Keluar
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuLabel>Belum masuk</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setGateOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" /> Daftar / Masuk
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dialog gate — wajib daftar/masuk untuk chat & unggah file */}
      <Dialog open={gateOpen} onOpenChange={setGateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-extrabold text-navy">
              Daftar akun Baboo.id
            </DialogTitle>
            <DialogDescription>
              Untuk chat dengan agent dan menyimpan file proyek, daftar atau masuk dulu. Gratis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={() => void handleGoogleGate()}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-navy bg-white px-4 py-2.5 text-sm font-bold text-navy transition hover:bg-cream-deep disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon className="shrink-0" />
              )}
              {googleLoading ? "Mengarahkan ke Google…" : "Lanjut dengan Google"}
            </button>
            <Link
              to="/masuk"
              className="flex w-full items-center justify-center rounded-full border-2 border-navy/15 px-4 py-2.5 text-sm font-bold text-navy/70 transition hover:border-navy/30 hover:text-navy"
            >
              Masuk dengan email
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
