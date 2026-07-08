import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { FlaskConical, Loader2, Lock, LogOut, Mail, ShieldAlert } from "lucide-react";
import { CartoonButton } from "@/components/cartoon-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AiLabPanel } from "@/components/ai-lab-panel";
import { useIsAdmin } from "@/lib/ai-lab";
import { useAuth } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "AI Lab — Baboo Backend" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminPage,
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

function AdminPage() {
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

function AdminShell({ email, onSignOut }: { email: string; onSignOut: () => Promise<void> }) {
  const { data: isAdmin, isLoading } = useIsAdmin();

  const handleSignOut = async () => {
    try {
      await onSignOut();
    } catch {
      /* abaikan */
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b-[3px] border-navy bg-navy">
        <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-7 py-4">
          <div className="flex items-center gap-3 text-cream">
            <FlaskConical className="h-6 w-6" />
            <div>
              <p className="font-display text-lg font-extrabold leading-tight">Baboo AI Lab</p>
              <p className="text-xs opacity-70">Backend — ai.baboo.id</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-cream/80 sm:block">{email}</p>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full border-2 border-cream/40 px-4 py-2 text-sm font-semibold text-cream transition hover:bg-cream hover:text-navy"
            >
              <LogOut className="h-4 w-4" /> Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1180px] flex-1 px-7 py-10">
        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-mint-deep" />
          </div>
        ) : isAdmin ? (
          <AiLabPanel />
        ) : (
          <div className="card-pop mx-auto max-w-md p-8 text-center">
            <ShieldAlert className="mx-auto h-10 w-10 text-coral" />
            <h1 className="mt-4 font-display text-2xl font-extrabold text-navy">Akses Terbatas</h1>
            <p className="mt-2 text-sm opacity-75">Akun {email} belum terdaftar sebagai admin.</p>
          </div>
        )}
      </main>
    </div>
  );
}
