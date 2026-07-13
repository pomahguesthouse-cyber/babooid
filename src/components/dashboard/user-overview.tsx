import { Link } from "@tanstack/react-router";
import {
  Archive,
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  Plus,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useProjects } from "@/lib/projects";

/** Ambil nama tampilan & avatar dari metadata akun (mis. Google). */
function useProfile() {
  const { user } = useAuth();
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    (meta.full_name as string) ||
    (meta.name as string) ||
    user?.email?.split("@")[0] ||
    "Pengguna";
  const avatar = (meta.avatar_url as string) || (meta.picture as string) || null;
  const email = user?.email ?? "";
  const initial = name.charAt(0).toUpperCase();
  const firstName = name.trim().split(/\s+/)[0] || name;
  return { name, firstName, avatar, email, initial };
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof FolderKanban;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border-2 border-navy/10 bg-white px-3.5 py-3 shadow-[0_3px_0_rgba(19,41,75,0.08)] sm:px-4">
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${accent}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="font-display text-2xl font-extrabold text-navy">{value}</p>
        <p className="truncate text-xs text-navy/60">{label}</p>
      </div>
    </div>
  );
}

export function UserOverview({ onCreate }: { onCreate: () => void }) {
  const { name, firstName, avatar, email, initial } = useProfile();
  const { data: projects } = useProjects();

  const total = projects?.length ?? 0;
  const aktif = projects?.filter((project) => project.status === "aktif").length ?? 0;
  const selesai =
    projects?.filter((project) => project.status === "selesai").length ?? 0;
  const arsip = projects?.filter((project) => project.status === "arsip").length ?? 0;
  const recentProject = [...(projects ?? [])].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  )[0];

  return (
    <section className="overflow-hidden rounded-[26px] border-[2.5px] border-navy bg-white shadow-pop">
      <div className="relative overflow-hidden bg-navy px-5 py-6 text-cream sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full border-[34px] border-mint/15" />
        <div className="pointer-events-none absolute bottom-4 right-8 grid grid-cols-3 gap-2 opacity-20">
          {Array.from({ length: 9 }).map((_, index) => (
            <span key={index} className="h-1.5 w-1.5 rounded-full bg-sun" />
          ))}
        </div>

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                referrerPolicy="no-referrer"
                className="h-14 w-14 shrink-0 rounded-2xl border-2 border-cream/80 object-cover shadow-[0_4px_0_rgba(0,0,0,0.2)] sm:h-16 sm:w-16"
              />
            ) : (
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-cream/80 bg-mint font-display text-xl font-extrabold text-navy-deep shadow-[0_4px_0_rgba(0,0,0,0.2)] sm:h-16 sm:w-16 sm:text-2xl">
                {initial}
              </span>
            )}

            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-mint">
                <Sparkles className="h-3.5 w-3.5" />
                Ruang kerja Anda
              </div>
              <h1 className="truncate font-display text-3xl font-extrabold text-cream sm:text-4xl">
                Halo, {firstName}!
              </h1>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-cream/70">
                Kelola proyek, dokumen teknis, dan percakapan dengan tim AI Baboo
                dari satu tempat.
              </p>
              {email ? (
                <p className="mt-2 truncate text-xs text-cream/45">{email}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex items-center gap-2 rounded-full border-[2.5px] border-cream bg-sun px-4 py-2.5 font-display text-sm font-extrabold text-navy-deep shadow-[0_5px_0_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_rgba(0,0,0,0.22)]"
            >
              <Plus className="h-4 w-4" />
              Proyek baru
            </button>

            {recentProject ? (
              <Link
                to="/dashboard/$projectId"
                params={{ projectId: recentProject.id }}
                className="inline-flex items-center gap-2 rounded-full border-[2.5px] border-cream/80 bg-cream/10 px-4 py-2.5 font-display text-sm font-extrabold text-cream transition hover:bg-cream hover:text-navy"
              >
                Lanjutkan terakhir
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                to="/cara-kerja"
                className="inline-flex items-center gap-2 rounded-full border-[2.5px] border-cream/80 bg-cream/10 px-4 py-2.5 font-display text-sm font-extrabold text-cream transition hover:bg-cream hover:text-navy"
              >
                Lihat cara kerja
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 bg-cream-deep/45 p-4 sm:p-5 lg:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          label="Total proyek"
          value={total}
          accent="bg-cream-deep text-mint-deep"
        />
        <StatCard
          icon={Sparkles}
          label="Sedang aktif"
          value={aktif}
          accent="bg-mint/20 text-mint-deep"
        />
        <StatCard
          icon={CheckCircle2}
          label="Selesai"
          value={selesai}
          accent="bg-sun/25 text-sun-deep"
        />
        <StatCard
          icon={Archive}
          label="Diarsipkan"
          value={arsip}
          accent="bg-navy/10 text-navy"
        />
      </div>
    </section>
  );
}
