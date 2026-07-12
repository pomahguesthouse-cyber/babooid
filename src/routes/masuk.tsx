import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Lock, Mail, ShieldCheck, UserRound } from "lucide-react";
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
      { title: "Masuk atau Daftar Member — Baboo.id" },
      {
        name: "description",
        content: "Masuk ke dashboard atau daftar sebagai Member Baboo.id menggunakan email.",
      },
      { property: "og:title", content: "Masuk atau Daftar Member — Baboo.id" },
      {
        property: "og:description",
        content: "Masuk ke dashboard atau bergabung sebagai Member Baboo.id.",
      },
    ],
  }),
  component: LoginPage,
});

type AuthMode = "login" | "register";

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [submitting, setSubmitting] = useState(false);

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

  const handleLogin = async (form: HTMLFormElement) => {
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    toast.success("Berhasil masuk!");
    navigate({ to: "/dashboard" });
  };

  const handleRegister = async (form: HTMLFormElement) => {
    const fullName = (form.elements.namedItem("fullName") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const passwordConfirmation = (
      form.elements.namedItem("passwordConfirmation") as HTMLInputElement
    ).value;

    if (fullName.length < 2) {
      throw new Error("Nama lengkap minimal 2 karakter.");
    }

    if (password.length < 8) {
      throw new Error("Kata sandi minimal 8 karakter.");
    }

    if (password !== passwordConfirmation) {
      throw new Error("Konfirmasi kata sandi tidak sama.");
    }

    const emailRedirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name: fullName,
          account_type: "member",
        },
      },
    });

    if (error) throw error;

    if (data.session) {
      toast.success("Pendaftaran berhasil. Selamat datang di Baboo.id!");
      navigate({ to: "/dashboard" });
      return;
    }

    toast.success("Pendaftaran berhasil. Silakan cek email untuk mengaktifkan akun.", {
      duration: 7000,
    });
    form.reset();
    setMode("login");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requireConfig()) return;

    setSubmitting(true);
    try {
      if (mode === "register") {
        await handleRegister(event.currentTarget);
      } else {
        await handleLogin(event.currentTarget);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Proses autentikasi gagal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-cream-deep">
        <div className="absolute -left-20 -top-16 h-[220px] w-[220px] rounded-full bg-mint opacity-30" />
        <div className="absolute -bottom-16 -right-16 h-[200px] w-[200px] rounded-full bg-sun opacity-35" />

        <div className="relative mx-auto grid min-h-[calc(100vh-160px)] max-w-[1180px] items-center gap-12 px-7 py-16 lg:grid-cols-2">
          <div className="hidden lg:block">
            <span className="eyebrow text-mint-deep">
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
                <path d="M8 1l1.6 4.7L14 7l-4.4 1.3L8 13l-1.6-4.7L2 7l4.4-1.3L8 1z" fill="currentColor" />
              </svg>
              {mode === "register" ? "Bergabung dengan Baboo.id" : "Selamat datang kembali"}
            </span>
            <h1 className="mt-3 font-display text-[clamp(30px,4vw,46px)] font-extrabold text-navy">
              {mode === "register" ? "Jadi Member Baboo.id" : "Masuk ke dashboard Baboo"}
            </h1>
            <p className="mt-4 max-w-md text-[17px] opacity-85">
              {mode === "register"
                ? "Buat akun member untuk mengelola proyek, memakai AI Agent, dan menyimpan pekerjaanmu dalam satu dashboard."
                : "Kelola AI Agent, pantau percakapan, dan atur otomatisasi bisnismu dalam satu tempat."}
            </p>
            <div className="mt-8 flex items-end gap-4">
              <BibiMascot width={150} height={140} />
              <div className="card-pop mb-3 max-w-[240px] p-4 text-sm">
                {mode === "register"
                  ? "Daftar dulu, Kak. Biar semua proyek dan percakapanmu tersimpan rapi. 🐵"
                  : "Halo! Aku Bibi. Yuk masuk, biar aku bantu kerja-kerja repetitifmu. 🐵"}
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="card-pop space-y-6 p-8">
              <div className="grid grid-cols-2 rounded-2xl border-[2.5px] border-navy bg-cream-deep p-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`rounded-xl px-4 py-2.5 font-display text-sm font-bold transition ${
                    mode === "login" ? "bg-navy text-cream" : "text-navy hover:bg-white/70"
                  }`}
                  aria-pressed={mode === "login"}
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`rounded-xl px-4 py-2.5 font-display text-sm font-bold transition ${
                    mode === "register" ? "bg-navy text-cream" : "text-navy hover:bg-white/70"
                  }`}
                  aria-pressed={mode === "register"}
                >
                  Daftar Member
                </button>
              </div>

              <div className="text-center lg:text-left">
                <h2 className="font-display text-2xl font-extrabold text-navy">
                  {mode === "register" ? "Daftar Member" : "Masuk"}
                </h2>
                <p className="mt-1 text-sm opacity-80">
                  {mode === "register"
                    ? "Isi data berikut untuk membuat akun Baboo.id."
                    : "Gunakan email dan kata sandi yang terdaftar."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" ? (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nama lengkap</Label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        minLength={2}
                        autoComplete="name"
                        placeholder="Nama lengkap"
                        className="pl-9"
                      />
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="nama@email.com"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Kata sandi</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={mode === "register" ? 8 : undefined}
                      autoComplete={mode === "register" ? "new-password" : "current-password"}
                      placeholder="••••••••"
                      className="pl-9"
                    />
                  </div>
                  {mode === "register" ? (
                    <p className="text-xs opacity-60">Minimal 8 karakter.</p>
                  ) : null}
                </div>

                {mode === "register" ? (
                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirmation">Ulangi kata sandi</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                      <Input
                        id="passwordConfirmation"
                        name="passwordConfirmation"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="pl-9"
                      />
                    </div>
                  </div>
                ) : null}

                <CartoonButton type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {submitting
                    ? "Memproses..."
                    : mode === "register"
                      ? "Daftar sebagai Member"
                      : "Masuk"}
                </CartoonButton>
              </form>

              <p className="text-center text-sm opacity-80">
                {mode === "register" ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "register" ? "login" : "register")}
                  className="font-semibold text-mint-deep hover:underline"
                >
                  {mode === "register" ? "Masuk di sini" : "Daftar sebagai Member"}
                </button>
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
