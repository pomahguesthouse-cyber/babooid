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

    // detectSessionInUrl di client Supabase otomatis menukar kode OAuth
    // menjadi sesi. Kita cukup menunggu sesi tersedia lalu redirect.
    const finish = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error) {
        toast.error(error.message);
        navigate({ to: "/masuk" });
        return;
      }
      if (data.session) {
        toast.success("Berhasil masuk!");
        navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/masuk" });
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        toast.success("Berhasil masuk!");
        navigate({ to: "/dashboard" });
      }
    });

    // Beri sedikit waktu untuk pemrosesan URL, lalu cek sesi.
    const t = setTimeout(finish, 600);

    return () => {
      active = false;
      clearTimeout(t);
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-deep px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-mint-deep" />
        <p className="font-display text-lg font-bold text-navy">Menyelesaikan proses masuk...</p>
      </div>
    </div>
  );
}
