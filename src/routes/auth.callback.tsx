import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    // Supabase memproses kode aktivasi dari URL dan membentuk sesi pengguna.
    const finish = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error) {
        toast.error(error.message);
        navigate({ to: "/masuk" });
        return;
      }
      if (data.session) {
        toast.success("Akun aktif. Selamat datang di Baboo.id!");
        navigate({ to: "/dashboard" });
      } else {
        toast.info("Aktivasi selesai. Silakan masuk menggunakan akun Anda.");
        navigate({ to: "/masuk" });
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        toast.success("Akun aktif. Selamat datang di Baboo.id!");
        navigate({ to: "/dashboard" });
      }
    });

    const timer = setTimeout(finish, 600);

    return () => {
      active = false;
      clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-deep px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-mint-deep" />
        <p className="font-display text-lg font-bold text-navy">Mengaktifkan akun member...</p>
      </div>
    </div>
  );
}
