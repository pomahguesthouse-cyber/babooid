import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Cpu, Eye, EyeOff, KeyRound, Loader2, Save, Settings } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAiSettings, useUpsertAiSetting } from "@/lib/ai-lab";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [{ title: "Settings — Baboo AI Lab" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: settings, isLoading } = useAiSettings();
  const upsert = useUpsertAiSetting();

  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [defaultModel, setDefaultModel] = useState("");
  const [models, setModels] = useState("");

  useEffect(() => {
    if (!settings) return;
    setApiKey(settings.anthropic_api_key ?? "");
    setDefaultModel(settings.default_model ?? "");
    setModels((settings.models ?? "").split(",").filter(Boolean).join("\n"));
  }, [settings]);

  const save = async () => {
    try {
      await Promise.all([
        upsert.mutateAsync({ key: "anthropic_api_key", value: apiKey.trim() }),
        upsert.mutateAsync({ key: "default_model", value: defaultModel.trim() }),
        upsert.mutateAsync({
          key: "models",
          value: models
            .split("\n")
            .map((m) => m.trim())
            .filter(Boolean)
            .join(","),
        }),
      ]);
      toast.success("Pengaturan disimpan. Berlaku dalam ±1 menit (cache edge function).");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan pengaturan.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm opacity-60">
          <Link to="/admin" className="hover:underline">
            Admin
          </Link>{" "}
          / <span className="font-semibold text-navy">Settings</span>
        </p>
        <h1 className="flex items-center gap-3 font-display text-3xl font-extrabold text-navy">
          <Settings className="h-7 w-7 text-mint-deep" /> Settings
        </h1>
        <p className="mt-1 text-sm opacity-70">
          Konfigurasi API & model yang dipakai semua agent.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-7 w-7 animate-spin text-mint-deep" />
        </div>
      ) : (
        <section className="space-y-6 rounded-2xl border-2 border-navy/10 bg-white p-6 shadow-sm">
          <div className="space-y-1.5">
            <Label htmlFor="api-key" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-mint-deep" /> Anthropic API Key
            </Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                autoComplete="off"
                className="pr-10 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? "Sembunyikan" : "Tampilkan"}
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-navy/50 hover:bg-cream-deep"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs opacity-55">
              Dipakai edge functions (preview & agent). Buat di console.anthropic.com → API Keys.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="default-model" className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-mint-deep" /> Model Default
            </Label>
            <Input
              id="default-model"
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              placeholder="claude-sonnet-4-6"
            />
            <p className="text-xs opacity-55">
              Dipakai bila agent tidak menentukan model sendiri.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="models">Daftar Model Tersedia (satu per baris)</Label>
            <Textarea
              id="models"
              rows={4}
              value={models}
              onChange={(e) => setModels(e.target.value)}
              className="font-mono text-xs"
              placeholder={"claude-sonnet-4-6\nclaude-opus-4-8\nclaude-haiku-4-5"}
            />
            <p className="text-xs opacity-55">
              Menjadi pilihan dropdown "Model" di halaman tiap agent.
            </p>
          </div>

          <div className="flex justify-end border-t border-navy/10 pt-4">
            <button
              type="button"
              onClick={() => void save()}
              disabled={upsert.isPending}
              className="inline-flex items-center gap-2 rounded-full bg-sun px-5 py-2 text-sm font-bold text-navy-deep shadow-[0_4px_0_rgba(11,27,46,0.2)] transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {upsert.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Simpan Pengaturan
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
