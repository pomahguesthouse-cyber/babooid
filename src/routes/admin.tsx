import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Bot,
  BookOpen,
  ChevronDown,
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Settings,
  ShieldAlert,
  Users,
  Wrench,
} from "lucide-react";
import { CartoonButton } from "@/components/cartoon-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAiAgents, useIsAdmin } from "@/lib/ai-lab";
import { useAuth } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "AI Lab — Baboo Backend" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLayout,
});

/** Di production, halaman admin hanya dilayani lewat ai.baboo.id. */
function useAdminHostRedirect() {
  useEffect(() => {
    const host = window.location.hostname;
    const isMainDomain =
      (host === "baboo.id" || host.endsWith(".baboo.id")) && !host.startsWith("ai.");
    if (isMainDomain) {
      window.location.replace("https://ai.baboo.id/admin");
    }
  }, []);
}

function AdminLayout() {
  useAdminHostRedirect();
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-deep">
        <Loader2 className="h-8 w-8 animate-spin text-mint-deep" />
      </div>
    );
  }

  if (!user) return <AdminLogin />;

  return <AdminShell email={user.email ?? ""} onSignOut={signOut} />;
}

function AdminLogin() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error("Supabase belum dikonfigurasi.");
      return;
    }
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Berhasil masuk.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-3 text-cream">
          <FlaskConical className="h-7 w-7" />
          <p className="font-display text-xl font-extrabold">Baboo AI Lab</p>
        </div>
        <div className="card-pop space-y-5 bg-cream p-8">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-navy">Masuk Backend</h1>
            <p className="mt-1 text-sm opacity-75">Khusus admin. Gunakan email & password.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <CartoonButton type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Masuk
            </CartoonButton>
          </form>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Shell: sidebar + konten
// ---------------------------------------------------------------
function NavItem({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: typeof Bot;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        active ? "bg-sun/25 text-navy" : "text-navy/65 hover:bg-cream-deep hover:text-navy"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function AdminShell({ email, onSignOut }: { email: string; onSignOut: () => Promise<void> }) {
  const { data: isAdmin, isLoading } = useIsAdmin();
  const { data: agents } = useAiAgents();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [agentsOpen, setAgentsOpen] = useState(true);

  const handleSignOut = async () => {
    try {
      await onSignOut();
    } catch {
      /* abaikan */
    }
  };

  let body: ReactNode;
  if (isLoading) {
    body = (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mint-deep" />
      </div>
    );
  } else if (!isAdmin) {
    body = (
      <div className="card-pop mx-auto max-w-md p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-coral" />
        <h1 className="mt-4 font-display text-2xl font-extrabold text-navy">Akses Terbatas</h1>
        <p className="mt-2 text-sm opacity-75">Akun {email} belum terdaftar sebagai admin.</p>
      </div>
    );
  } else {
    body = <Outlet />;
  }

  return (
    <div className="flex min-h-screen bg-cream/60">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r-2 border-navy/10 bg-white lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy text-cream">
            <FlaskConical className="h-4.5 w-4 " />
          </span>
          <span className="font-display text-lg font-extrabold text-navy">Baboo.id</span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          <NavItem
            to="/admin"
            icon={LayoutDashboard}
            label="Dashboard"
            active={pathname === "/admin"}
          />

          <button
            type="button"
            onClick={() => setAgentsOpen(!agentsOpen)}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              pathname.startsWith("/admin/agents")
                ? "bg-sun/25 text-navy"
                : "text-navy/65 hover:bg-cream-deep hover:text-navy"
            }`}
          >
            <span className="flex items-center gap-3">
              <Users className="h-4 w-4" /> Agents
            </span>
            <ChevronDown className={`h-4 w-4 transition ${agentsOpen ? "rotate-180" : ""}`} />
          </button>
          {agentsOpen ? (
            <div className="ml-4 space-y-0.5 border-l-2 border-navy/10 pl-3">
              <Link
                to="/admin"
                className="block rounded-lg px-3 py-1.5 text-xs font-semibold text-navy/60 hover:bg-cream-deep hover:text-navy"
              >
                Semua Agents
              </Link>
              {(agents ?? []).map((a) => (
                <Link
                  key={a.id}
                  to="/admin/agents/$key"
                  params={{ key: a.key }}
                  className={`block rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    pathname === `/admin/agents/${a.key}`
                      ? "bg-sun/25 text-navy"
                      : "text-navy/60 hover:bg-cream-deep hover:text-navy"
                  }`}
                >
                  {a.name.replace("Baboo ", "").toUpperCase()}
                </Link>
              ))}
            </div>
          ) : null}

          <NavItem to="/admin" icon={BookOpen} label="Knowledge Base" active={false} />
          <NavItem to="/admin" icon={Wrench} label="Tools" active={false} />
          <NavItem to="/admin" icon={ClipboardList} label="SOP" active={false} />
          <NavItem to="/admin" icon={Settings} label="Settings" active={false} />
        </nav>

        <div className="border-t-2 border-navy/10 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-cream">
              <Bot className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-navy">Admin Baboo</p>
              <p className="truncate text-xs opacity-60">{email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-navy/15 px-3 py-2 text-xs font-bold text-navy transition hover:bg-navy hover:text-cream"
          >
            <LogOut className="h-3.5 w-3.5" /> Keluar
          </button>
        </div>
      </aside>

      {/* Konten */}
      <div className="min-w-0 flex-1">
        {/* Header mobile */}
        <header className="flex items-center justify-between border-b-2 border-navy/10 bg-white px-5 py-3 lg:hidden">
          <span className="flex items-center gap-2 font-display font-extrabold text-navy">
            <FlaskConical className="h-5 w-5" /> Baboo AI Lab
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Keluar"
            className="text-navy/70"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>
        <main className="mx-auto w-full max-w-[1280px] px-6 py-8">{body}</main>
      </div>
    </div>
  );
}
