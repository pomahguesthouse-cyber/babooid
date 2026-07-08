import { useState, type FormEvent } from "react";
import {
  Bot,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FlaskConical,
  GraduationCap,
  Wrench,
  BookOpen,
  ShieldAlert,
  FileText,
  Link2,
  Paperclip,
  Play,
} from "lucide-react";
import { CartoonButton } from "@/components/cartoon-ui";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  useIsAdmin,
  useAiAgents,
  useCreateAiAgent,
  useUpdateAiAgent,
  useDeleteAiAgent,
  useAiTools,
  useCreateAiTool,
  useUpdateAiTool,
  useDeleteAiTool,
  useAiAgentTools,
  useToggleAgentTool,
  useAiKnowledge,
  useCreateAiKnowledge,
  useDeleteAiKnowledge,
  getKnowledgeFileUrl,
  useTrainingExamples,
  useCreateTrainingExample,
  useDeleteTrainingExample,
  useTrainingRuns,
  useCreateTrainingRun,
  type AiAgent,
  type AiTool,
  type AiKnowledge,
  type AiKnowledgeSource,
  type AiToolType,
} from "@/lib/ai-lab";

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
const agentStatusStyle: Record<AiAgent["status"], string> = {
  draft: "bg-navy/10 text-navy",
  aktif: "bg-mint/25 text-mint-deep",
  nonaktif: "bg-coral/25 text-coral-deep",
};

const runStatusStyle: Record<string, string> = {
  antre: "bg-navy/10 text-navy",
  berjalan: "bg-sun/30 text-sun-deep",
  selesai: "bg-mint/25 text-mint-deep",
  gagal: "bg-coral/25 text-coral-deep",
};

function field(form: HTMLFormElement, name: string): string {
  const el = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
  return el?.value.trim() ?? "";
}

function errMsg(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function AgentSelect({
  agents,
  value,
  onChange,
  placeholder = "Pilih agent",
}: {
  agents: AiAgent[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-56">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {agents.map((a) => (
          <SelectItem key={a.id} value={a.id}>
            {a.name} — {a.role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ---------------------------------------------------------------
// Page
// ---------------------------------------------------------------
export function AiLabPanel() {
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mint-deep" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="card-pop mx-auto max-w-md p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-coral" />
        <h1 className="mt-4 font-display text-2xl font-extrabold text-navy">Akses Terbatas</h1>
        <p className="mt-2 text-sm opacity-75">
          Halaman AI Lab hanya dapat diakses oleh admin Baboo.id.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-mint-deep">Backend</p>
          <h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-extrabold text-navy">
            <FlaskConical className="h-7 w-7 text-mint-deep" />
            AI Lab
          </h1>
          <p className="mt-1 text-sm opacity-75">
            Buat agent specialist, latih perilakunya, kelola tools, dan pustaka knowledge per
            keahlian.
          </p>
        </div>
      </div>

      <Tabs defaultValue="agents" className="mt-8">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="agents" className="gap-2">
            <Bot className="h-4 w-4" /> Agent Specialist
          </TabsTrigger>
          <TabsTrigger value="training" className="gap-2">
            <GraduationCap className="h-4 w-4" /> Training
          </TabsTrigger>
          <TabsTrigger value="tools" className="gap-2">
            <Wrench className="h-4 w-4" /> Tools
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-2">
            <BookOpen className="h-4 w-4" /> Pustaka Knowledge
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="mt-6">
          <AgentsTab />
        </TabsContent>
        <TabsContent value="training" className="mt-6">
          <TrainingTab />
        </TabsContent>
        <TabsContent value="tools" className="mt-6">
          <ToolsTab />
        </TabsContent>
        <TabsContent value="knowledge" className="mt-6">
          <KnowledgeTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------
// Tab 1 — Create Agent Specialist
// ---------------------------------------------------------------
function AgentsTab() {
  const { data: agents, isLoading } = useAiAgents();
  const createAgent = useCreateAiAgent();
  const updateAgent = useUpdateAiAgent();
  const deleteAgent = useDeleteAiAgent();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AiAgent | null>(null);
  const [toDelete, setToDelete] = useState<AiAgent | null>(null);
  const [status, setStatus] = useState<AiAgent["status"]>("draft");

  const openCreate = () => {
    setEditing(null);
    setStatus("draft");
    setOpen(true);
  };
  const openEdit = (a: AiAgent) => {
    setEditing(a);
    setStatus(a.status);
    setOpen(true);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = {
      key: field(form, "key").toLowerCase(),
      name: field(form, "name"),
      role: field(form, "role"),
      description: field(form, "description"),
      system_prompt: field(form, "system_prompt"),
      model: field(form, "model") || "claude-sonnet-4-5",
      temperature: Number(field(form, "temperature") || "0.7"),
      status,
    };
    if (!payload.key || !payload.name) return;
    try {
      if (editing) {
        await updateAgent.mutateAsync({ id: editing.id, ...payload });
        toast.success("Agent diperbarui.");
      } else {
        await createAgent.mutateAsync(payload);
        toast.success("Agent specialist dibuat.");
      }
      setOpen(false);
    } catch (err) {
      toast.error(errMsg(err, "Gagal menyimpan agent."));
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteAgent.mutateAsync(toDelete.id);
      toast.success("Agent dihapus.");
    } catch (err) {
      toast.error(errMsg(err, "Gagal menghapus agent."));
    } finally {
      setToDelete(null);
    }
  };

  const saving = createAgent.isPending || updateAgent.isPending;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm opacity-75">
          Definisikan keahlian, system prompt, dan model untuk tiap agent.
        </p>
        <CartoonButton onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Buat Agent
        </CartoonButton>
      </div>

      {isLoading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-mint-deep" />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {(agents ?? []).map((a) => (
            <div key={a.id} className="card-pop flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${a.accent}`}>
                    <Bot className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display font-bold text-navy">{a.name}</p>
                    <p className="text-xs opacity-70">{a.role}</p>
                  </div>
                </div>
                <Badge className={agentStatusStyle[a.status]}>{a.status}</Badge>
              </div>
              {a.description ? <p className="mt-3 text-sm opacity-75">{a.description}</p> : null}
              <p className="mt-2 text-xs opacity-60">
                Model: {a.model} · Temp: {a.temperature}
              </p>
              <div className="mt-4 flex gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(a)}
                  aria-label="Edit"
                  className="grid h-8 w-8 place-items-center rounded-lg text-navy/60 hover:bg-cream-deep hover:text-navy"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(a)}
                  aria-label="Hapus"
                  className="grid h-8 w-8 place-items-center rounded-lg text-coral-deep/70 hover:bg-coral/15 hover:text-coral-deep"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Agent" : "Buat Agent Specialist"}</DialogTitle>
            <DialogDescription>Tentukan identitas dan keahlian agent baru.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="key">Key (slug)</Label>
                <Input
                  id="key"
                  name="key"
                  defaultValue={editing?.key ?? ""}
                  placeholder="mis. mep-engineer"
                  pattern="[a-z0-9-]{2,40}"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editing?.name ?? ""}
                  placeholder="mis. Baboo MEP"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Keahlian / Role</Label>
              <Input
                id="role"
                name="role"
                defaultValue={editing?.role ?? ""}
                placeholder="mis. Insinyur MEP"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                name="description"
                rows={2}
                defaultValue={editing?.description ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="system_prompt">System Prompt</Label>
              <Textarea
                id="system_prompt"
                name="system_prompt"
                rows={5}
                defaultValue={editing?.system_prompt ?? ""}
                placeholder="Kamu adalah ahli ... yang membantu ..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  name="model"
                  defaultValue={editing?.model ?? "claude-sonnet-4-5"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  name="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  defaultValue={editing?.temperature ?? 0.7}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as AiAgent["status"])}>
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
            <DialogFooter>
              <CartoonButton type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editing ? "Simpan" : "Buat Agent"}
              </CartoonButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(toDelete)} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus agent “{toDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua knowledge, contoh training, dan relasi tools milik agent ini ikut terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---------------------------------------------------------------
// Tab 2 — Training AI Agent
// ---------------------------------------------------------------
function TrainingTab() {
  const { data: agents } = useAiAgents();
  const [agentId, setAgentId] = useState<string>("");
  const { data: examples, isLoading: loadingExamples } = useTrainingExamples(agentId || undefined);
  const { data: runs } = useTrainingRuns(agentId || undefined);
  const createExample = useCreateTrainingExample();
  const deleteExample = useDeleteTrainingExample();
  const createRun = useCreateTrainingRun();

  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agentId) return;
    const form = e.currentTarget;
    const user_input = field(form, "user_input");
    const ideal_output = field(form, "ideal_output");
    if (!user_input || !ideal_output) return;
    try {
      await createExample.mutateAsync({
        agent_id: agentId,
        user_input,
        ideal_output,
        notes: field(form, "notes") || undefined,
      });
      toast.success("Contoh training ditambahkan.");
      setOpen(false);
    } catch (err) {
      toast.error(errMsg(err, "Gagal menambah contoh."));
    }
  };

  const startRun = async () => {
    if (!agentId) return;
    const agent = agents?.find((a) => a.id === agentId);
    try {
      await createRun.mutateAsync({
        agent_id: agentId,
        name: `Training ${agent?.name ?? ""} — ${new Date().toLocaleDateString("id-ID")}`,
      });
      toast.success("Sesi training dimasukkan ke antrean.");
    } catch (err) {
      toast.error(errMsg(err, "Gagal memulai training."));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <AgentSelect agents={agents ?? []} value={agentId} onChange={setAgentId} />
          <p className="text-sm opacity-70">Pilih agent, tambahkan contoh input → output ideal.</p>
        </div>
        <div className="flex gap-2">
          <CartoonButton variant="light" onClick={() => setOpen(true)} disabled={!agentId}>
            <Plus className="h-4 w-4" /> Tambah Contoh
          </CartoonButton>
          <CartoonButton onClick={startRun} disabled={!agentId || createRun.isPending}>
            <Play className="h-4 w-4" /> Mulai Training
          </CartoonButton>
        </div>
      </div>

      {!agentId ? (
        <div className="card-pop mt-6 p-8 text-center text-sm opacity-70">
          Pilih agent terlebih dahulu untuk melihat data training-nya.
        </div>
      ) : loadingExamples ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-mint-deep" />
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {(examples ?? []).length === 0 ? (
              <div className="card-pop p-8 text-center text-sm opacity-70">
                Belum ada contoh training untuk agent ini.
              </div>
            ) : (
              (examples ?? []).map((ex) => (
                <div key={ex.id} className="card-pop p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2 text-sm">
                      <p>
                        <span className="font-semibold text-navy">Input:</span> {ex.user_input}
                      </p>
                      <p>
                        <span className="font-semibold text-mint-deep">Output ideal:</span>{" "}
                        {ex.ideal_output}
                      </p>
                      {ex.notes ? <p className="text-xs opacity-60">Catatan: {ex.notes}</p> : null}
                    </div>
                    <button
                      type="button"
                      aria-label="Hapus contoh"
                      onClick={() =>
                        deleteExample
                          .mutateAsync(ex.id)
                          .then(() => toast.success("Contoh dihapus."))
                          .catch((err) => toast.error(errMsg(err, "Gagal menghapus.")))
                      }
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-coral-deep/70 hover:bg-coral/15 hover:text-coral-deep"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {(runs ?? []).length > 0 ? (
            <div className="mt-8">
              <h2 className="font-display text-lg font-bold text-navy">Riwayat Sesi Training</h2>
              <div className="mt-3 space-y-2">
                {(runs ?? []).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-2xl border-2 border-navy/15 bg-cream px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-navy">{r.name}</p>
                      <p className="text-xs opacity-60">
                        {new Date(r.created_at).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <Badge className={runStatusStyle[r.status] ?? ""}>{r.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Contoh Training</DialogTitle>
            <DialogDescription>
              Pasangan input pengguna dan jawaban ideal dari agent.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user_input">Input pengguna</Label>
              <Textarea id="user_input" name="user_input" rows={3} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ideal_output">Output ideal</Label>
              <Textarea id="ideal_output" name="ideal_output" rows={4} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (opsional)</Label>
              <Input id="notes" name="notes" />
            </div>
            <DialogFooter>
              <CartoonButton type="submit" disabled={createExample.isPending}>
                {createExample.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Simpan
              </CartoonButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------
// Tab 3 — Tools
// ---------------------------------------------------------------
function ToolsTab() {
  const { data: tools, isLoading } = useAiTools();
  const { data: agents } = useAiAgents();
  const { data: agentTools } = useAiAgentTools();
  const createTool = useCreateAiTool();
  const updateTool = useUpdateAiTool();
  const deleteTool = useDeleteAiTool();
  const toggleAgentTool = useToggleAgentTool();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AiTool | null>(null);
  const [toDelete, setToDelete] = useState<AiTool | null>(null);
  const [type, setType] = useState<AiToolType>("fungsi");

  const openCreate = () => {
    setEditing(null);
    setType("fungsi");
    setOpen(true);
  };
  const openEdit = (t: AiTool) => {
    setEditing(t);
    setType(t.type);
    setOpen(true);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = field(form, "name");
    if (!name) return;
    let config: Record<string, unknown> = {};
    const rawConfig = field(form, "config");
    if (rawConfig) {
      try {
        config = JSON.parse(rawConfig) as Record<string, unknown>;
      } catch {
        toast.error("Config harus JSON yang valid.");
        return;
      }
    }
    const payload = {
      name,
      description: field(form, "description"),
      type,
      config,
    };
    try {
      if (editing) {
        await updateTool.mutateAsync({ id: editing.id, ...payload });
        toast.success("Tool diperbarui.");
      } else {
        await createTool.mutateAsync(payload);
        toast.success("Tool dibuat.");
      }
      setOpen(false);
    } catch (err) {
      toast.error(errMsg(err, "Gagal menyimpan tool."));
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteTool.mutateAsync(toDelete.id);
      toast.success("Tool dihapus.");
    } catch (err) {
      toast.error(errMsg(err, "Gagal menghapus tool."));
    } finally {
      setToDelete(null);
    }
  };

  const isAttached = (agentId: string, toolId: string) =>
    (agentTools ?? []).some((at) => at.agent_id === agentId && at.tool_id === toolId);

  const saving = createTool.isPending || updateTool.isPending;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm opacity-75">Kelola tools (fungsi, API, MCP) dan tautkan ke agent.</p>
        <CartoonButton onClick={openCreate}>
          <Plus className="h-4 w-4" /> Buat Tool
        </CartoonButton>
      </div>

      {isLoading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-mint-deep" />
        </div>
      ) : (tools ?? []).length === 0 ? (
        <div className="card-pop mt-6 p-8 text-center text-sm opacity-70">
          Belum ada tool. Buat tool pertama Anda.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {(tools ?? []).map((t) => (
            <div key={t.id} className="card-pop p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-sun text-navy-deep">
                    <Wrench className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display font-bold text-navy">{t.name}</p>
                    <p className="text-xs uppercase tracking-wide opacity-60">{t.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-70">Aktif</span>
                    <Switch
                      checked={t.enabled}
                      onCheckedChange={(checked) =>
                        updateTool
                          .mutateAsync({ id: t.id, enabled: checked })
                          .catch((err) => toast.error(errMsg(err, "Gagal mengubah status.")))
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    aria-label="Edit"
                    className="grid h-8 w-8 place-items-center rounded-lg text-navy/60 hover:bg-cream-deep hover:text-navy"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(t)}
                    aria-label="Hapus"
                    className="grid h-8 w-8 place-items-center rounded-lg text-coral-deep/70 hover:bg-coral/15 hover:text-coral-deep"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {t.description ? <p className="mt-3 text-sm opacity-75">{t.description}</p> : null}
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-50">
                  Dipakai oleh agent
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(agents ?? []).map((a) => {
                    const attached = isAttached(a.id, t.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() =>
                          toggleAgentTool
                            .mutateAsync({
                              agent_id: a.id,
                              tool_id: t.id,
                              attach: !attached,
                            })
                            .catch((err) => toast.error(errMsg(err, "Gagal mengubah relasi.")))
                        }
                        className={`rounded-full border-2 px-3 py-1 text-xs font-semibold transition ${
                          attached
                            ? "border-mint-deep bg-mint/25 text-mint-deep"
                            : "border-navy/15 bg-cream text-navy/60 hover:border-navy/30"
                        }`}
                      >
                        {a.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Tool" : "Buat Tool"}</DialogTitle>
            <DialogDescription>Definisikan tool yang bisa dipakai agent.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editing?.name ?? ""}
                  placeholder="mis. hitung-volume-beton"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select value={type} onValueChange={(v) => setType(v as AiToolType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fungsi">Fungsi</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="mcp">MCP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                name="description"
                rows={2}
                defaultValue={editing?.description ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="config">Config (JSON, opsional)</Label>
              <Textarea
                id="config"
                name="config"
                rows={4}
                className="font-mono text-xs"
                defaultValue={editing ? JSON.stringify(editing.config, null, 2) : ""}
                placeholder='{"endpoint": "https://..."}'
              />
            </div>
            <DialogFooter>
              <CartoonButton type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editing ? "Simpan" : "Buat Tool"}
              </CartoonButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(toDelete)} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus tool “{toDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Tool ini akan dilepas dari semua agent yang memakainya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---------------------------------------------------------------
// Tab 4 — Pustaka Knowledge per agent
// ---------------------------------------------------------------
const sourceIcon: Record<AiKnowledgeSource, typeof FileText> = {
  teks: FileText,
  url: Link2,
  file: Paperclip,
};

function KnowledgeTab() {
  const { data: agents } = useAiAgents();
  const [agentId, setAgentId] = useState<string>("");
  const { data: items, isLoading } = useAiKnowledge(agentId || undefined);
  const createKnowledge = useCreateAiKnowledge();
  const deleteKnowledge = useDeleteAiKnowledge();

  const [open, setOpen] = useState(false);
  const [sourceType, setSourceType] = useState<AiKnowledgeSource>("teks");
  const [file, setFile] = useState<File | null>(null);
  const [toDelete, setToDelete] = useState<AiKnowledge | null>(null);

  const agentName = (id: string) => agents?.find((a) => a.id === id)?.name ?? "—";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agentId) return;
    const form = e.currentTarget;
    const title = field(form, "title");
    if (!title) return;
    const tags = field(form, "tags")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      await createKnowledge.mutateAsync({
        agent_id: agentId,
        title,
        source_type: sourceType,
        content: sourceType === "teks" ? field(form, "content") : undefined,
        url: sourceType === "url" ? field(form, "url") : undefined,
        file: sourceType === "file" ? (file ?? undefined) : undefined,
        tags,
      });
      toast.success("Knowledge ditambahkan.");
      setOpen(false);
      setFile(null);
    } catch (err) {
      toast.error(errMsg(err, "Gagal menambah knowledge."));
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteKnowledge.mutateAsync(toDelete);
      toast.success("Knowledge dihapus.");
    } catch (err) {
      toast.error(errMsg(err, "Gagal menghapus knowledge."));
    } finally {
      setToDelete(null);
    }
  };

  const openFile = async (item: AiKnowledge) => {
    if (!item.storage_path) return;
    try {
      const url = await getKnowledgeFileUrl(item.storage_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(errMsg(err, "Gagal membuka file."));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <AgentSelect agents={agents ?? []} value={agentId} onChange={setAgentId} />
          <p className="text-sm opacity-70">Pustaka referensi sesuai keahlian tiap agent.</p>
        </div>
        <CartoonButton onClick={() => setOpen(true)} disabled={!agentId}>
          <Plus className="h-4 w-4" /> Tambah Knowledge
        </CartoonButton>
      </div>

      {!agentId ? (
        <div className="card-pop mt-6 p-8 text-center text-sm opacity-70">
          Pilih agent untuk melihat pustaka knowledge-nya.
        </div>
      ) : isLoading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-mint-deep" />
        </div>
      ) : (items ?? []).length === 0 ? (
        <div className="card-pop mt-6 p-8 text-center text-sm opacity-70">
          Belum ada knowledge untuk {agentName(agentId)}.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {(items ?? []).map((k) => {
            const Icon = sourceIcon[k.source_type];
            return (
              <div key={k.id} className="card-pop flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint text-navy-deep">
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="truncate font-display font-bold text-navy">{k.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setToDelete(k)}
                    aria-label="Hapus"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-coral-deep/70 hover:bg-coral/15 hover:text-coral-deep"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {k.source_type === "teks" && k.content ? (
                  <p className="mt-3 line-clamp-3 text-sm opacity-75">{k.content}</p>
                ) : null}
                {k.source_type === "url" && k.url ? (
                  <a
                    href={k.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 truncate text-sm text-mint-deep underline"
                  >
                    {k.url}
                  </a>
                ) : null}
                {k.source_type === "file" && k.storage_path ? (
                  <button
                    type="button"
                    onClick={() => openFile(k)}
                    className="mt-3 text-left text-sm text-mint-deep underline"
                  >
                    Buka file
                  </button>
                ) : null}
                {k.tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {k.tags.map((tag) => (
                      <Badge key={tag} className="bg-navy/10 text-navy">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Knowledge — {agentName(agentId)}</DialogTitle>
            <DialogDescription>Tambahkan teks, tautan, atau file referensi.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Judul</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
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
            </div>
            {sourceType === "teks" ? (
              <div className="space-y-2">
                <Label htmlFor="content">Isi</Label>
                <Textarea id="content" name="content" rows={5} required />
              </div>
            ) : null}
            {sourceType === "url" ? (
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input id="url" name="url" type="url" placeholder="https://" required />
              </div>
            ) : null}
            {sourceType === "file" ? (
              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (pisahkan dengan koma)</Label>
              <Input id="tags" name="tags" placeholder="sni, struktur, beton" />
            </div>
            <DialogFooter>
              <CartoonButton type="submit" disabled={createKnowledge.isPending}>
                {createKnowledge.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Simpan
              </CartoonButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(toDelete)} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus knowledge “{toDelete?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              File terkait di storage juga akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
