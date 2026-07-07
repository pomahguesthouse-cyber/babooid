import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bot, Eye, EyeOff, Loader2, Lock, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { CartoonButton } from "@/components/cartoon-ui";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/backend")({
  head: () => ({ meta: [{ title: "Backend AI — Baboo.id" }] }),
  component: BackendPage,
});

const ADMIN_EMAIL = "ical.smg@gmail.com";

type ProviderKey = "claude" | "openai" | "gemini";

type ProviderSetting = {
  provider: ProviderKey;
  display_name: string;
  model_name: string;
  endpoint_url: string;
  access_token: string;
  enabled: boolean;
  notes: string;
};

const defaults: ProviderSetting[] = [
  { provider: "claude", display_name: "Claude", model_name: "", endpoint_url: "", access_token: "", enabled: true, notes: "" },
  { provider: "openai", display_name: "OpenAI / ChatGPT", model_name: "", endpoint_url: "", access_token: "", enabled: true, notes: "" },
  { provider: "gemini", display_name: "Gemini", model_name: "", endpoint_url: "", access_token: "", enabled: true, notes: "" },
];

const accents: Record<ProviderKey, string> = {
  claude: "bg-coral/20 text-coral-deep",
  openai: "bg-mint/25 text-mint-deep",
  gemini: "bg-sun/30 text-sun-deep",
};

function mergeRows(rows: ProviderSetting[]) {
  return defaults.map((item) => rows.find((row) => row.provider === item.provider) ?? item);
}

function BackendPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ProviderSetting[]>(defaults);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState<ProviderKey | null>(null);
  const [visible, setVisible] = useState<Record<ProviderKey, boolean>>({ claude: false, openai: false, gemini: false });

  const isAdmin = useMemo(() => user?.email?.toLowerCase() === ADMIN_EMAIL, [user?.email]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/masuk" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user || !isAdmin) {
      setBusy(false);
      return;
    }

    let active = true;
    setBusy(true);

    supabase
      .from("model_provider_settings")
      .select("provider, display_name, model_name, endpoint_url, access_token, enabled, notes")
      .order("provider")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) toast.error(error.message);
        setItems(error ? defaults : mergeRows((data ?? []) as ProviderSetting[]));
        setBusy(false);
      });

    return () => {
      active = false;
    };
  }, [user, isAdmin]);

  function patch(provider: ProviderKey, value: Partial<ProviderSetting>) {
    setItems((prev) => prev.map((item) => (item.provider === provider ? { ...item, ...value } : item)));
  }

  async function save(item: ProviderSetting) {
    if (!user || !isAdmin) return;
    setSaving(item.provider);

    const { error } = await supabase.from("model_provider_settings").upsert(
      {
        provider: item.provider,
        display_name: item.display_name,
        model_name: item.model_name.trim(),
        endpoint_url: item.endpoint_url.trim(),
        access_token: item.access_token.trim(),
        enabled: item.enabled,
        notes: item.notes.trim(),
        updated_by: user.id,
      },
      { onConflict: "provider" },
    );

    setSaving(null);
    if (error) toast.error(error.message);
    else toast.success(`${item.display_name} disimpan.`);
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-deep">
        <Loader2 className="h-8 w-8 animate-spin text-mint-deep" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-7 py-10">
        <section className="card-pop overflow-hidden p-0">
          <div className="border-b-2 border-navy/10 bg-cream-deep/50 p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-mint-deep">Backend</p>
                <h1 className="mt-2 font-display text-4xl font-extrabold text-navy">AI Model Settings</h1>
                <p className="mt-2 max-w-2xl text-sm opacity-75">
                  Kelola provider model AI untuk Claude, OpenAI / ChatGPT, dan Gemini. Login memakai Google.
                </p>
              </div>
              <div className="rounded-2xl border-2 border-navy/15 bg-cream px-4 py-3 text-sm">
                <div className="flex items-center gap-2 font-bold text-navy">
                  <ShieldCheck className="h-4 w-4 text-mint-deep" /> Administrator
                </div>
                <p className="mt-1 opacity-70">{ADMIN_EMAIL}</p>
              </div>
            </div>
          </div>

          {!isAdmin ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-coral/15 text-coral-deep">
                <Lock className="h-7 w-7" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-extrabold text-navy">Akses ditolak</h2>
              <p className="mt-2 max-w-md text-sm opacity-70">
                Akun saat ini: <b>{user.email}</b>. Backend hanya untuk <b>{ADMIN_EMAIL}</b>.
              </p>
            </div>
          ) : busy ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-mint-deep" />
            </div>
          ) : (
            <div className="grid gap-5 p-6 lg:grid-cols-3">
              {items.map((item) => {
                const show = visible[item.provider];
                return (
                  <article key={item.provider} className="rounded-[28px] border-2 border-navy/15 bg-cream p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${accents[item.provider]}`}>
                          <Bot className="h-5 w-5" />
                        </span>
                        <div>
                          <h2 className="font-display text-xl font-extrabold text-navy">{item.display_name}</h2>
                          <p className="text-xs uppercase tracking-wide opacity-55">{item.provider}</p>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-bold text-navy">
                        <input type="checkbox" checked={item.enabled} onChange={(e) => patch(item.provider, { enabled: e.target.checked })} />
                        Aktif
                      </label>
                    </div>

                    <div className="mt-5 space-y-4">
                      <Field label="Model">
                        <input value={item.model_name} onChange={(e) => patch(item.provider, { model_name: e.target.value })} placeholder="nama model" className="input-backend" />
                      </Field>
                      <Field label="Endpoint URL">
                        <input value={item.endpoint_url} onChange={(e) => patch(item.provider, { endpoint_url: e.target.value })} placeholder="https://..." className="input-backend" />
                      </Field>
                      <Field label="Kode akses">
                        <div className="flex rounded-2xl border-2 border-navy/15 bg-white focus-within:border-mint-deep">
                          <input type={show ? "text" : "password"} value={item.access_token} onChange={(e) => patch(item.provider, { access_token: e.target.value })} placeholder="isi kode akses provider" className="min-w-0 flex-1 rounded-l-2xl bg-transparent px-4 py-3 text-sm outline-none" />
                          <button type="button" onClick={() => setVisible((prev) => ({ ...prev, [item.provider]: !prev[item.provider] }))} className="grid w-11 place-items-center text-navy/65 hover:text-navy">
                            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </Field>
                      <Field label="Catatan">
                        <textarea value={item.notes} onChange={(e) => patch(item.provider, { notes: e.target.value })} rows={3} placeholder="catatan internal" className="input-backend resize-none" />
                      </Field>
                    </div>

                    <CartoonButton type="button" onClick={() => save(item)} disabled={saving === item.provider} className="mt-5 w-full justify-center">
                      {saving === item.provider ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Simpan
                    </CartoonButton>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide opacity-60">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
