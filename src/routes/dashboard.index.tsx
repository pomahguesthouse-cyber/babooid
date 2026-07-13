import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Clock3,
  DraftingCompass,
  FolderKanban,
  FolderPlus,
  Loader2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { CartoonButton } from "@/components/cartoon-ui";
import { UserOverview } from "@/components/dashboard/user-overview";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "@/lib/projects";
import type { Project } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/")({
  component: ProjectsPage,
});

const statusStyle: Record<Project["status"], string> = {
  aktif: "border-mint-deep/20 bg-mint/20 text-mint-deep",
  selesai: "border-sun-deep/15 bg-sun/25 text-sun-deep",
  arsip: "border-navy/10 bg-navy/10 text-navy/70",
};

const statusOptions = ["semua", "aktif", "selesai", "arsip"] as const;
type StatusFilter = (typeof statusOptions)[number];

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

function formatProjectCardDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tidak tersedia";

  return `${new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");

  const sortedProjects = useMemo(
    () =>
      [...(projects ?? [])].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      ),
    [projects],
  );

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("id-ID");

    return sortedProjects.filter((project) => {
      const matchesStatus =
        statusFilter === "semua" || project.status === statusFilter;
      const matchesQuery =
        !query ||
        project.name.toLocaleLowerCase("id-ID").includes(query) ||
        (project.description ?? "")
          .toLocaleLowerCase("id-ID")
          .includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [searchQuery, sortedProjects, statusFilter]);

  const recentProject = sortedProjects[0];

  const statusCounts = useMemo(
    () => ({
      semua: projects?.length ?? 0,
      aktif:
        projects?.filter((project) => project.status === "aktif").length ?? 0,
      selesai:
        projects?.filter((project) => project.status === "selesai").length ?? 0,
      arsip:
        projects?.filter((project) => project.status === "arsip").length ?? 0,
    }),
    [projects],
  );

  const openCreate = () => {
    setEditing(null);
    setEditOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    setEditOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = (
      form.elements.namedItem("name") as HTMLInputElement
    ).value.trim();
    const description = (
      form.elements.namedItem("description") as HTMLTextAreaElement
    ).value.trim();
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
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menyimpan proyek.",
      );
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteProject.mutateAsync(toDelete.id);
      toast.success("Proyek dihapus.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus proyek.",
      );
    } finally {
      setToDelete(null);
    }
  };

  const saving = createProject.isPending || updateProject.isPending;
  const hasProjects = Boolean(projects?.length);
  const hasActiveFilters = Boolean(searchQuery.trim()) || statusFilter !== "semua";

  return (
    <div>
      <UserOverview onCreate={openCreate} />

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <button
          type="button"
          onClick={openCreate}
          className="group flex min-h-[112px] items-center gap-4 rounded-2xl border-2 border-navy bg-mint/20 p-4 text-left shadow-[0_4px_0_rgba(19,41,75,0.14)] transition hover:-translate-y-0.5 hover:bg-mint/30"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint text-navy-deep">
            <FolderPlus className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-base font-extrabold text-navy">
              Buat proyek baru
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-navy/60">
              Siapkan ruang kerja dan konteks untuk Baboo Mandor.
            </span>
          </span>
          <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-navy/45 transition group-hover:translate-x-1 group-hover:text-navy" />
        </button>

        {recentProject ? (
          <Link
            to="/dashboard/$projectId"
            params={{ projectId: recentProject.id }}
            className="group flex min-h-[112px] items-center gap-4 rounded-2xl border-2 border-navy/15 bg-white p-4 shadow-[0_4px_0_rgba(19,41,75,0.09)] transition hover:-translate-y-0.5 hover:border-mint-deep"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sun/25 text-sun-deep">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-navy/45">
                Terakhir dibuka
              </span>
              <span className="mt-1 block truncate font-display text-base font-extrabold text-navy">
                {recentProject.name}
              </span>
              <span className="block truncate text-xs text-navy/55">
                {formatProjectCardDate(recentProject.updated_at)}
              </span>
            </span>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-navy/45 transition group-hover:translate-x-1 group-hover:text-navy" />
          </Link>
        ) : (
          <Link
            to="/cara-kerja"
            className="group flex min-h-[112px] items-center gap-4 rounded-2xl border-2 border-navy/15 bg-white p-4 shadow-[0_4px_0_rgba(19,41,75,0.09)] transition hover:-translate-y-0.5 hover:border-mint-deep"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sun/25 text-sun-deep">
              <Bot className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display text-base font-extrabold text-navy">
                Kenali cara kerja Baboo
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-navy/60">
                Lihat bagaimana Mandor mengoordinasikan para spesialis.
              </span>
            </span>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-navy/45 transition group-hover:translate-x-1 group-hover:text-navy" />
          </Link>
        )}

        <Link
          to="/cad-agent"
          className="group flex min-h-[112px] items-center gap-4 rounded-2xl border-2 border-navy/15 bg-white p-4 shadow-[0_4px_0_rgba(19,41,75,0.09)] transition hover:-translate-y-0.5 hover:border-mint-deep sm:col-span-2 xl:col-span-1"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal/20 text-teal-deep">
            <DraftingCompass className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-display text-base font-extrabold text-navy">
              Buka Baboo CAD
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-navy/60">
              Asisten gambar teknik untuk kebutuhan drafting Anda.
            </span>
          </span>
          <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-navy/45 transition group-hover:translate-x-1 group-hover:text-navy" />
        </Link>
      </section>

      <section className="mt-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="eyebrow text-mint-deep">Folder Proyek</p>
            <h2 className="mt-1 font-display text-3xl font-extrabold text-navy">
              Proyek Anda
            </h2>
            <p className="mt-1 text-sm text-navy/65">
              Cari, kelola, dan lanjutkan pekerjaan dari ruang yang sama.
            </p>
          </div>

          <CartoonButton onClick={openCreate} className="hidden xl:inline-flex">
            <Plus className="h-4 w-4" />
            Buat proyek
          </CartoonButton>
        </div>

        {hasProjects ? (
          <div className="mt-5 rounded-2xl border-2 border-navy/10 bg-white p-3 shadow-[0_4px_0_rgba(19,41,75,0.07)] sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative block flex-1 lg:max-w-sm">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/40" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Cari nama atau deskripsi proyek…"
                  className="h-11 rounded-xl border-2 border-navy/15 bg-cream/60 pl-10"
                  aria-label="Cari proyek"
                />
              </label>

              <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
                {statusOptions.map((status) => {
                  const active = statusFilter === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold capitalize transition ${
                        active
                          ? "border-navy bg-navy text-cream"
                          : "border-navy/10 bg-cream text-navy/65 hover:border-navy/30 hover:text-navy"
                      }`}
                    >
                      {status}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                          active ? "bg-cream/15" : "bg-navy/10"
                        }`}
                      >
                        {statusCounts[status]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-7 w-7 animate-spin text-mint-deep" />
            </div>
          ) : !hasProjects ? (
            <div className="card-pop relative flex flex-col items-center gap-4 overflow-hidden px-6 py-14 text-center sm:py-16">
              <div className="pointer-events-none absolute inset-0 dot-pattern opacity-25" />
              <span className="relative grid h-16 w-16 place-items-center rounded-2xl border-2 border-navy/10 bg-cream-deep">
                <FolderPlus className="h-7 w-7 text-mint-deep" />
              </span>
              <div className="relative">
                <h3 className="font-display text-xl font-extrabold text-navy">
                  Ruang kerja masih kosong
                </h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-navy/65">
                  Buat proyek pertama, tambahkan konteks dan file pendukung, lalu
                  mulai berdiskusi dengan Baboo Mandor.
                </p>
              </div>
              <CartoonButton onClick={openCreate} className="relative">
                <Plus className="h-4 w-4" />
                Buat proyek pertama
              </CartoonButton>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-navy/20 bg-white/60 px-6 py-12 text-center">
              <Search className="mx-auto h-7 w-7 text-navy/35" />
              <h3 className="mt-3 font-display text-lg font-extrabold text-navy">
                Proyek tidak ditemukan
              </h3>
              <p className="mt-1 text-sm text-navy/60">
                Coba ubah kata pencarian atau pilih status lain.
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("semua");
                  }}
                  className="mt-4 text-sm font-bold text-mint-deep hover:underline"
                >
                  Reset pencarian
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <article
                  key={project.id}
                  className="group flex min-h-[280px] flex-col overflow-hidden rounded-[20px] border-[2.5px] border-navy bg-white shadow-[5px_5px_0_rgba(19,41,75,0.14)] transition hover:-translate-y-1 hover:shadow-[8px_9px_0_rgba(19,41,75,0.17)]"
                >
                  <div className="flex items-start justify-between gap-3 border-b-2 border-navy/10 bg-cream-deep/55 p-4">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-navy/10 bg-white text-mint-deep">
                      <FolderKanban className="h-5 w-5" />
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${statusStyle[project.status]}`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-display text-lg font-extrabold leading-snug text-navy">
                      {project.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-navy/60">
                      {project.description || "Belum ada deskripsi proyek."}
                    </p>

                    <div className="mt-4 space-y-2 rounded-xl border border-navy/10 bg-cream/55 px-3 py-2.5 text-xs text-navy/55">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-mint-deep" />
                        <span className="truncate">
                          Dibuat {formatProjectCardDate(project.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-3.5 w-3.5 shrink-0 text-mint-deep" />
                        <span className="truncate">
                          Diperbarui {formatProjectCardDate(project.updated_at)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-navy/10 pt-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(project)}
                          aria-label={`Edit ${project.name}`}
                          className="grid h-8 w-8 place-items-center rounded-lg text-navy/55 transition hover:bg-cream-deep hover:text-navy"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setToDelete(project)}
                          aria-label={`Hapus ${project.name}`}
                          className="grid h-8 w-8 place-items-center rounded-lg text-coral-deep/65 transition hover:bg-coral/15 hover:text-coral-deep"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <Link
                        to="/dashboard/$projectId"
                        params={{ projectId: project.id }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3.5 py-2 text-xs font-bold text-cream transition hover:bg-mint-deep"
                      >
                        Buka proyek
                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="font-display">
                {editing ? "Edit proyek" : "Buat proyek baru"}
              </DialogTitle>
              <DialogDescription>
                Beri nama dan deskripsi singkat agar Baboo Mandor memahami
                konteks pekerjaan.
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

      <AlertDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus proyek?</AlertDialogTitle>
            <AlertDialogDescription>
              Proyek <strong>{toDelete?.name}</strong> beserta seluruh file dan
              riwayat chat akan dihapus permanen. Tindakan ini tidak bisa
              dibatalkan.
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
