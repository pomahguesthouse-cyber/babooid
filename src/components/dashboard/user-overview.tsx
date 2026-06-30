import { FolderKanban, CheckCircle2, Archive } from "lucide-react";
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
  return { name, avatar, email, initial };
}

function StatChip({
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
    <div className="flex items-center gap-3 rounded-2xl border-2 border-navy/10 bg-cream px-4 py-3">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${accent}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="leading-tight">
        <p className="font-display text-xl font-extrabold text-navy">{value}</p>
        <p className="text-xs opacity-65">{label}</p>
      </div>
    </div>
  );
}

export function UserOverview() {
  const { name, avatar, email, initial } = useProfile();
  const { data: projects } = useProjects();

  const total = projects?.length ?? 0;
  const aktif = projects?.filter((p) => p.status === "aktif").length ?? 0;
  const selesai = projects?.filter((p) => p.status === "selesai").length ?? 0;

  return (
    <div className="card-pop overflow-hidden p-0">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              referrerPolicy="no-referrer"
              className="h-14 w-14 rounded-2xl border-2 border-navy object-cover"
            />
          ) : (
            <span className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-navy bg-mint font-display text-xl font-extrabold text-navy-deep">
              {initial}
            </span>
          )}
          <div>
            <p className="text-sm opacity-70">Selamat datang kembali,</p>
            <h2 className="font-display text-2xl font-extrabold leading-tight text-navy">
              {name}
            </h2>
            {email ? <p className="text-sm opacity-60">{email}</p> : null}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatChip
            icon={FolderKanban}
            label="Total proyek"
            value={total}
            accent="bg-cream-deep text-mint-deep"
          />
          <StatChip
            icon={CheckCircle2}
            label="Aktif"
            value={aktif}
            accent="bg-mint/25 text-mint-deep"
          />
          <StatChip
            icon={Archive}
            label="Selesai"
            value={selesai}
            accent="bg-sun/30 text-sun-deep"
          />
        </div>
      </div>
    </div>
  );
}
