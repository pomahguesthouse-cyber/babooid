import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { CartoonButton } from "@/components/cartoon-ui";
import { BibiMascot } from "@/components/bibi-mascot";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/masuk")({
  head: () => ({
    meta: [
      { title: "Masuk — Baboo.id" },
      {
        name: "description",
        content: "Masuk ke akun Baboo.id menggunakan akun Google atau email Anda.",
      },
      { property: "og:title", content: "Masuk — Baboo.id" },
      { property: "og:description", content: "Masuk ke dashboard Baboo.id." },
    ],
  }),
  component: LoginPage,
});

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18" aria-hidden>
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

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, signInWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // Jika sudah login, arahkan ke dashboard.
  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, navigate]);

  const requireConfig = () => {
    if (!isSupabaseConfigured) {
      toast.error("Supabase belum dikonfigurasi. Isi .env terlebih dahulu (lihat .env.example).");
      return false;
    }
    return true;
  };

  const handleGoogle = async () => {
    if (!requireConfig()) return;
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Browser akan diarahkan ke Google; tidak perlu reset state.
    } catch (err) {
      setGoogleLoading(false);
      toast.error(err instanceof Error ? err.message : "Gagal masuk dengan Google.");
    }
  };

  const handleEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!requireConfig()) return;
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    setEmailLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setEmailLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Berhasil masuk!");
    navigate({ to: "/dashboard" });
  };

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-cream-deep">
        <div className="absolute -left-20 -top-16 h-[220px] w-[220px] rounded-full bg-mint opacity-30" />
        <div className="absolute -right-16 -bottom-16 h-[200px] w-[200px] rounded-full bg-sun opacity-35" />

        <div className="relative mx-auto grid min-h-[calc(100vh-160px)] max-w-[1180px] items-center gap-12 px-7 py-16 lg:grid-cols-2">
          {/* Sisi kiri — sambutan */}
          <div className="hidden lg:block">
            <span className="eyebrow text-mint-deep">
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
                <path d="M8 1l1.6 4.7L14 7l-4.4 1.3L8 13l-1.6-4.7L2 7l4.4-1.3L8 1z" fill="currentColor" />
              </svg>
              Selamat datang kembali
            </span>
            <h1 className="mt-3 font-display text-[clamp(30px,4vw,46px)] font-extrabold text-navy">
              Masuk ke dashboard Baboo
            </h1>
            <p className="mt-4 max-w-md text-[17px] opacity-85">
              Kelola AI Agent, pantau percakapan, dan atur otomatisasi bisnismu dalam satu tempat.
            </p>
            <div className="mt-8 flex items-end gap-4">
              <BibiMascot width={150} height={140} />
              <div className="card-pop mb-3 max-w-[230px] p-4 text-sm">
                Halo! Aku Bibi. Yuk masuk, biar aku bantu kerja-kerja repetitifmu. 🐵
              </div>
            </div>
          </div>

          {/* Sisi kanan — form */}
          <div className="mx-auto w-full max-w-md">
            <div className="card-pop space-y-6 p-8">
              <div className="text-center lg:text-left">
                <h2 className="font-display text-2xl font-extrabold text-navy">Masuk</h2>
                <p className="mt-1 text-sm opacity-80">
                  Gunakan akun Google atau email yang terdaftar.
                </p>
              </div>

              <CartoonButton
                type="button"
                variant="light"
                className="w-full"
                onClick={handleGoogle}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <GoogleIcon className="shrink-0" />
                )}
                {googleLoading ? "Mengarahkan ke Google..." : "Lanjut dengan Google"}
              </CartoonButton>

              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide opacity-60">
                <span className="h-px flex-1 bg-navy/20" />
                atau
                <span className="h-px flex-1 bg-navy/20" />
              </div>

              <form onSubmit={handleEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="nama@email.com"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Kata sandi</Label>
                    <a href="#" className="text-xs font-semibold text-mint-deep hover:underline">
                      Lupa sandi?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="pl-9"
                    />
                  </div>
                </div>
                <CartoonButton type="submit" className="w-full" disabled={emailLoading}>
                  {emailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {emailLoading ? "Memproses..." : "Masuk"}
                </CartoonButton>
              </form>

              <p className="text-center text-sm opacity-80">
                Belum punya akun?{" "}
                <a href="/kontak" className="font-semibold text-mint-deep hover:underline">
                  Hubungi kami
                </a>
              </p>
            </div>

            <p className="mt-4 flex items-center justify-center gap-2 text-xs opacity-60">
              <ShieldCheck className="h-3.5 w-3.5" />
              Data Anda aman dan terenkripsi.
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
