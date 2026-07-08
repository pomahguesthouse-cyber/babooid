import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Globe, KeyRound, Loader2, Save, Settings } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAiProviders, useUpdateAiProvider, type AiProvider } from "@/lib/ai-lab";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [{ title: "Settings — Baboo AI Lab" }],
  }),
  component: SettingsPage,
});

const keyPlaceholder: Record<string, string> = {
  anthropic: "sk-ant-...",
  google: "AIza...",
  openrouter: "sk-or-...",
  openai: "sk-...",
  custom: "API key endpoint Anda",
};

const providerHint: Record<string, string> = {
  anthropic: "Buat API key di console.anthropic.com → API Keys.",
  google: "Buat API key gratis di aistudio.google.com → Get API key.",
  openrouter: "Satu key untuk ratusan model. Buat di openrouter.ai → Keys.",
  openai: "Buat API key di platform.openai.com → API keys.",
  custom: "Endpoint apa pun yang kompatibel format OpenAI (Ollama, Groq, DeepSeek, dll).",
};

function SettingsPage() {
  const { data: providers, isLoading } = useAiProviders();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm opacity-60">
          <Link to="/admin" className="hover:underline">
            Admin
          </Link>{" "}
          / <span className="font-semibold text-navy">Settings</span>
        </p>
        <h1 className="flex items-center gap-3 font-display text-3xl font-extrabold text-navy">
          <Settings className="h-7 w-7 text-mint-deep" /> Settings — API & Model
        </h1>
        <p className="mt-1 text-sm opacity-70">
          Kelola provider AI. Agent bisa memakai provider berbeda-beda (diatur di halaman tiap
          agent).
        </p>
      </div>

      {isLoading || !providers ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-7 w-7 animate-spin text-mint-deep" />
        </div>
      ) : (
        <Tabs defaultValue={providers[0]?.key ?? "anthropic"}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            {providers.map((p) => (
              <TabsTrigger key={p.key} value={p.key} className="gap-2">
                {p.name}
                {p.enabled ? <span className="h-1.5 w-1.5 rounded-full bg-mint-deep" /> : null}
              </TabsTrigger>
            ))}
          </TabsList>
          {providers.map((p) => (
            <TabsContent key={p.key} value={p.key} className="mt-4">
              <ProviderForm provider={p} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

function ProviderForm({ provider }: { provider: AiProvider }) {
  const update = useUpdateAiProvider();
  const [enabled, setEnabled] = useState(provider.enabled);
  const [baseUrl, setBaseUrl] = useState(provider.base_url);
  const [apiKey, setApiKey] = useState(provider.api_key);
  const [showKey, setShowKey] = useState(false);
  const [models, setModels] = useState(
    provider.models.split(",").filter(Boolean).join("\n"),
  );

  useEffect(() => {
    setEnabled(provider.enabled);
    setBaseUrl(provider.base_url);
    setApiKey(provider.api_key);
    setModels(provider.models.split(",").filter(Boolean).join("\n"));
  }, [provider]);

  const isCustom = provider.key === "custom";

  const save = async () => {
    try {
      await update.mutateAsync({
        key: provider.key,
        enabled,
        base_url: baseUrl.trim().replace(/\/$/, ""),
        api_key: apiKey.trim(),
        models: models
          .split("\n")
          .map((m) => m.trim())
          .filter(Boolean)
          .join(","),
      });
      toast.success(`${provider.name} disimpan. Berlaku dalam ±1 menit.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan.");
    }
  };

  return (
    <section className="space-y-5 rounded-2xl border-2 border-navy/10 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-bold text-navy">{provider.name}</h2>
          <Badge className={enabled ? "bg-mint/25 text-mint-deep" : "bg-navy/10 text-navy"}>
            {enabled ? "aktif" : "nonaktif"}
          </Badge>
        </div>
        <label className="flex items-center gap-2 text-sm opacity-80">
          Aktifkan
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </label>
      </div>

      <p className="text-xs opacity-60">{providerHint[provider.key]}</p>

      <div className="space-y-1.5">
        <Label htmlFor={`url-${provider.key}`} className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-mint-deep" /> Base URL
        </Label>
        <Input
          id={`url-${provider.key}`}
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          readOnly={!isCustom}
          placeholder={isCustom ? "https://host-anda.com/v1" : ""}
          className={`font-mono text-xs ${!isCustom ? "bg-cream/50 opacity-70" : ""}`}
        />
        {!isCustom ? (
          <p className="text-xs opacity-45">Preset — tidak perlu diubah.</p>
        ) : (
          <p className="text-xs opacity-55">
            Harus kompatibel format OpenAI (endpoint /chat/completions).
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`key-${provider.key}`} className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-mint-deep" /> API Key
        </Label>
        <div className="relative">
          <Input
            id={`key-${provider.key}`}
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={keyPlaceholder[provider.key]}
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
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`models-${provider.key}`}>Daftar Model (satu per baris)</Label>
        <Textarea
          id={`models-${provider.key}`}
          rows={4}
          value={models}
          onChange={(e) => setModels(e.target.value)}
          className="font-mono text-xs"
        />
        <p className="text-xs opacity-55">
          Menjadi pilihan dropdown Model di halaman agent yang memakai provider ini.
        </p>
      </div>

      <div className="flex justify-end border-t border-navy/10 pt-4">
        <button
          type="button"
          onClick={() => void save()}
          disabled={update.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-sun px-5 py-2 text-sm font-bold text-navy-deep shadow-[0_4px_0_rgba(11,27,46,0.2)] transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {update.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Simpan {provider.name}
        </button>
      </div>
    </section>
  );
}
