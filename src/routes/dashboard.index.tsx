import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ArrowRight,
  FolderPlus,
  CalendarDays,
} from "lucide-react";
import { CartoonButton } from "@/components/cartoon-ui";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { UserOverview } from "@/components/dashboard/user-overview";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "@/lib/projects";
import type { Project } from "@/lib/types";

export const Route = createFileRoute("/dashboard/")({
  component: ProjectsPage,
});

const statusStyle: Record<Project["status"], string> = {
  aktif: "bg-mint/25 text-mint-deep",
  selesai: "bg-sun/30 text-sun-deep",
  arsip: "bg-navy/10 text-navy",
};

function formatProjectCreatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal tidak tersedia";

  return `${new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date)} WIB`;
}

function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [toDelete, setToDelete] = useState<Project | null>(null);

  const openCreate = () => {
    setEditing(null);
    setEditOpen(true);
  };
  const openEdit = (p: Project) => {
    setEditing(p);
    setEditOpen(true);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value.trim();
    if (!name) return;
    try {
      if (editing) {
        await updateProject.mutateAsync({ id: editing.id, name, description });
        toast.success("Proyek diperbarui.");
      } else {
        await createProject.mutateAsync({ name, description });
        toast.success("Proyek dibuat.");
      }
      setEditOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan proyek.");
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteProject.mutateAsync(toDelete.id);
      toast.success("Proyek dihapus.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus proyek.");
    } finally {
      setToDelete(null);
    }
  };

  const saving = createProject.isPending || updateProject.isPending;

  return (
    <div>
      <UserOverview />

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-mint-deep">Folder Proyek</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-navy">Proyek Anda</h1>
          <p className="mt-1 text-sm opacity-75">
            Kelola proyek, unggah file pendukung, dan ajak Baboo Mandor bekerja.
          </p>
        </div>
        <CartoonButton onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Buat proyek
        </CartoonButton>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-mint-deep" />
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="card-pop flex flex-col items-center gap-4 px-6 py-16 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-cream-deep">
              <FolderPlus className="h-7 w-7 text-mint-deep" />
            </span>
            <div>
              <h3 className="font-display text-lg font-extrabold text-navy">Belum ada proyek</h3>
              <p className="mt-1 text-sm opacity-70">
                Mulai dengan membuat proyek pertama Anda.
              </p>
            </div>
            <CartoonButton onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Buat proyek
            </CartoonButton>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => (
              <div key={p.id} className="card-pop flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-cream-deep">
                    <FolderKanban className="h-5 w-5 text-mint-deep" />
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      aria-label="Edit"
                      className="grid h-8 w-8 place-items-center rounded-lg text-navy/60 hover:bg-cream-deep hover:text-navy"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(p)}
                      aria-label="Hapus"
                      className="grid h-8 w-8 place-items-center rounded-lg text-coral-deep/70 hover:bg-coral/15 hover:text-coral-deep"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="mt-4 font-display text-lg font-extrabold leading-snug text-navy">
                  {p.name}
                </h3>
                <p className="mt-1 line-clamp-2 flex-1 text-sm opacity-70">
                  {p.description || "Tanpa deskripsi."}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusStyle[p.status]}`}
                  >
                    {p.status}
                  </span>
                  <Link
                    to="/dashboard/$projectId"
                    params={{ projectId: p.id }}
                    className="inline-flex items-center gap-1 text-sm font-bold text-mint-deep hover:gap-2"
                  >
                    Buka
                    <ArrowRight className="h-4 w-4 transition-all" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog buat/edit */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="font-display">
                {editing ? "Edit proyek" : "Buat proyek baru"}
              </DialogTitle>
              <DialogDescription>
                Beri nama dan deskripsi singkat agar Baboo Mandor paham konteksnya.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama proyek</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  maxLength={120}
                  defaultValue={editing?.name ?? ""}
                  placeholder="Contoh: Renovasi Gedung A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={editing?.description ?? ""}
                  placeholder="Tujuan, ruang lingkup, atau catatan penting proyek."
                />
              </div>
              {editing ? (
                <div className="flex items-center gap-3 rounded-2xl border border-navy/10 bg-cream-deep/60 px-4 py-3 text-sm text-navy/70">
                  <CalendarDays className="h-4 w-4 shrink-0 text-mint-deep" />
                  <span>
                    Dibuat pada{" "}
                    <strong className="font-semibold text-navy">
                      {formatProjectCreatedAt(editing.created_at)}
                    </strong>
                  </span>
                </div>
              ) : null}
            </div>
            <DialogFooter>
              <CartoonButton type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editing ? "Simpan perubahan" : "Buat proyek"}
              </CartoonButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Konfirmasi hapus */}
      <AlertDialog open={Boolean(toDelete)} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus proyek?</AlertDialogTitle>
            <AlertDialogDescription>
              Proyek <strong>{toDelete?.name}</strong> beserta seluruh file dan riwayat chat akan
              dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-coral text-navy-deep hover:bg-coral-deep hover:text-cream"
            >
              {deleteProject.isPending ? "Menghapus..." : "Ya, hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
