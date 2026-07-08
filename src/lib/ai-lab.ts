import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useAuth } from "./auth";

const KNOWLEDGE_BUCKET = "ai-knowledge";

// ---------------- TYPES ----------------
export type AiAgentStatus = "draft" | "aktif" | "nonaktif";

export type AiAgent = {
  id: string;
  key: string;
  name: string;
  role: string;
  description: string | null;
  system_prompt: string;
  model: string;
  temperature: number;
  status: AiAgentStatus;
  accent: string;
  provider: string;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AiToolType = "fungsi" | "api" | "mcp";

export type AiTool = {
  id: string;
  name: string;
  description: string | null;
  type: AiToolType;
  config: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type AiAgentTool = {
  agent_id: string;
  tool_id: string;
};

export type AiKnowledgeSource = "teks" | "file" | "url";

export type AiKnowledge = {
  id: string;
  agent_id: string;
  title: string;
  source_type: AiKnowledgeSource;
  content: string | null;
  url: string | null;
  storage_path: string | null;
  folder_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type AiKnowledgeFolder = {
  id: string;
  agent_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type AiTrainingExample = {
  id: string;
  agent_id: string;
  user_input: string;
  ideal_output: string;
  notes: string | null;
  created_at: string;
};

export type AiTrainingRunStatus = "antre" | "berjalan" | "selesai" | "gagal";

export type AiTrainingRun = {
  id: string;
  agent_id: string;
  name: string;
  status: AiTrainingRunStatus;
  metrics: Record<string, unknown>;
  notes: string | null;
  created_at: string;
  finished_at: string | null;
};

// ---------------- ADMIN ----------------
export function useIsAdmin() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase.rpc("is_admin");
      if (error) throw error;
      return Boolean(data);
    },
    enabled: Boolean(user),
  });
}

// ---------------- AGENTS ----------------
export function useAiAgents() {
  return useQuery({
    queryKey: ["ai-agents"],
    queryFn: async (): Promise<AiAgent[]> => {
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as AiAgent[];
    },
  });
}

export type AgentInput = {
  key: string;
  name: string;
  role: string;
  description?: string;
  system_prompt?: string;
  model?: string;
  temperature?: number;
  status?: AiAgentStatus;
  accent?: string;
  provider?: string;
  tags?: string[];
};

export function useCreateAiAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AgentInput) => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("ai_agents")
        .insert({ ...input, created_by: auth.user?.id ?? null })
        .select()
        .single();
      if (error) throw error;
      return data as AiAgent;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-agents"] }),
  });
}

export function useUpdateAiAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<AgentInput> & { id: string }) => {
      const { id, ...rest } = input;
      const { data, error } = await supabase
        .from("ai_agents")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as AiAgent;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-agents"] }),
  });
}

export function useDeleteAiAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_agents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-agents"] }),
  });
}

// ---------------- TOOLS ----------------
export function useAiTools() {
  return useQuery({
    queryKey: ["ai-tools"],
    queryFn: async (): Promise<AiTool[]> => {
      const { data, error } = await supabase
        .from("ai_tools")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as AiTool[];
    },
  });
}

export type ToolInput = {
  name: string;
  description?: string;
  type?: AiToolType;
  config?: Record<string, unknown>;
  enabled?: boolean;
};

export function useCreateAiTool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ToolInput) => {
      const { data, error } = await supabase.from("ai_tools").insert(input).select().single();
      if (error) throw error;
      return data as AiTool;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-tools"] }),
  });
}

export function useUpdateAiTool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<ToolInput> & { id: string }) => {
      const { id, ...rest } = input;
      const { data, error } = await supabase
        .from("ai_tools")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as AiTool;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-tools"] }),
  });
}

export function useDeleteAiTool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_tools").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-tools"] });
      qc.invalidateQueries({ queryKey: ["ai-agent-tools"] });
    },
  });
}

// ---------------- AGENT <-> TOOLS ----------------
export function useAiAgentTools() {
  return useQuery({
    queryKey: ["ai-agent-tools"],
    queryFn: async (): Promise<AiAgentTool[]> => {
      const { data, error } = await supabase.from("ai_agent_tools").select("agent_id, tool_id");
      if (error) throw error;
      return data as AiAgentTool[];
    },
  });
}

export function useToggleAgentTool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { agent_id: string; tool_id: string; attach: boolean }) => {
      if (input.attach) {
        const { error } = await supabase
          .from("ai_agent_tools")
          .insert({ agent_id: input.agent_id, tool_id: input.tool_id });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("ai_agent_tools")
          .delete()
          .eq("agent_id", input.agent_id)
          .eq("tool_id", input.tool_id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-agent-tools"] }),
  });
}

// ---------------- KNOWLEDGE ----------------
export function useAiKnowledge(agentId?: string) {
  return useQuery({
    queryKey: ["ai-knowledge", agentId ?? "all"],
    queryFn: async (): Promise<AiKnowledge[]> => {
      let query = supabase
        .from("ai_knowledge")
        .select("*")
        .order("created_at", { ascending: false });
      if (agentId) query = query.eq("agent_id", agentId);
      const { data, error } = await query;
      if (error) throw error;
      return data as AiKnowledge[];
    },
  });
}

export type KnowledgeInput = {
  agent_id: string;
  title: string;
  source_type: AiKnowledgeSource;
  content?: string;
  url?: string;
  tags?: string[];
  file?: File;
  folder_id?: string | null;
};

export function useCreateAiKnowledge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: KnowledgeInput) => {
      let storage_path: string | null = null;
      if (input.source_type === "file") {
        if (!input.file) throw new Error("File belum dipilih.");
        storage_path = `${input.agent_id}/${Date.now()}-${input.file.name}`;
        const { error: upErr } = await supabase.storage
          .from(KNOWLEDGE_BUCKET)
          .upload(storage_path, input.file);
        if (upErr) throw upErr;
      }
      const { data, error } = await supabase
        .from("ai_knowledge")
        .insert({
          agent_id: input.agent_id,
          title: input.title,
          source_type: input.source_type,
          content: input.content ?? null,
          url: input.url ?? null,
          storage_path,
          folder_id: input.folder_id ?? null,
          tags: input.tags ?? [],
        })
        .select()
        .single();
      if (error) throw error;
      return data as AiKnowledge;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-knowledge"] }),
  });
}

export type KnowledgeFilesInput = {
  agent_id: string;
  files: File[];
  tags?: string[];
  folder_id?: string | null;
  /** dipanggil tiap file selesai: (index, total, namaFile) */
  onProgress?: (done: number, total: number, fileName: string) => void;
};

/**
 * Upload beberapa file lokal sekaligus sebagai knowledge.
 * Judul knowledge diambil dari nama file. Mengembalikan baris yang berhasil dibuat.
 */
export function useCreateAiKnowledgeFiles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: KnowledgeFilesInput) => {
      const created: AiKnowledge[] = [];
      const total = input.files.length;
      for (let i = 0; i < total; i++) {
        const file = input.files[i];
        // Jika berasal dari pilih-folder, pertahankan struktur foldernya.
        const relPath =
          (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
        const safePath = relPath.replace(/[^\w./-]+/g, "_");
        const storage_path = `${input.agent_id}/${Date.now()}-${i}-${safePath}`;
        const { error: upErr } = await supabase.storage
          .from(KNOWLEDGE_BUCKET)
          .upload(storage_path, file);
        if (upErr) throw upErr;

        const { data, error } = await supabase
          .from("ai_knowledge")
          .insert({
            agent_id: input.agent_id,
            title: relPath.replace(/\.[^./\\]+$/, ""),
            source_type: "file",
            content: null,
            url: null,
            storage_path,
            folder_id: input.folder_id ?? null,
            tags: input.tags ?? [],
          })
          .select()
          .single();
        if (error) throw error;
        created.push(data as AiKnowledge);
        input.onProgress?.(i + 1, total, file.name);
      }
      return created;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-knowledge"] }),
  });
}

export function useDeleteAiKnowledge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: AiKnowledge) => {
      if (item.storage_path) {
        await supabase.storage.from(KNOWLEDGE_BUCKET).remove([item.storage_path]);
      }
      const { error } = await supabase.from("ai_knowledge").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-knowledge"] }),
  });
}

export async function getKnowledgeFileUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(KNOWLEDGE_BUCKET)
    .createSignedUrl(storagePath, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}

/** Pindahkan satu knowledge ke folder tertentu (null = root). */
export function useMoveAiKnowledge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, folder_id }: { id: string; folder_id: string | null }) => {
      const { error } = await supabase
        .from("ai_knowledge")
        .update({ folder_id })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-knowledge"] }),
  });
}

// ---------------- KNOWLEDGE FOLDERS (satu tingkat) ----------------
export function useAiKnowledgeFolders(agentId?: string) {
  return useQuery({
    queryKey: ["ai-knowledge-folders", agentId ?? "all"],
    queryFn: async (): Promise<AiKnowledgeFolder[]> => {
      let query = supabase
        .from("ai_knowledge_folders")
        .select("*")
        .order("name", { ascending: true });
      if (agentId) query = query.eq("agent_id", agentId);
      const { data, error } = await query;
      if (error) throw error;
      return data as AiKnowledgeFolder[];
    },
    enabled: !!agentId,
  });
}

export function useCreateKnowledgeFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ agent_id, name }: { agent_id: string; name: string }) => {
      const { data, error } = await supabase
        .from("ai_knowledge_folders")
        .insert({ agent_id, name })
        .select()
        .single();
      if (error) throw error;
      return data as AiKnowledgeFolder;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-knowledge-folders"] }),
  });
}

export function useRenameKnowledgeFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from("ai_knowledge_folders")
        .update({ name })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-knowledge-folders"] }),
  });
}

/** Hapus folder. File di dalamnya otomatis pindah ke root (ON DELETE SET NULL). */
export function useDeleteKnowledgeFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_knowledge_folders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-knowledge-folders"] });
      qc.invalidateQueries({ queryKey: ["ai-knowledge"] });
    },
  });
}

// ---------------- TRAINING ----------------
export function useTrainingExamples(agentId?: string) {
  return useQuery({
    queryKey: ["ai-training-examples", agentId ?? "all"],
    queryFn: async (): Promise<AiTrainingExample[]> => {
      let query = supabase
        .from("ai_training_examples")
        .select("*")
        .order("created_at", { ascending: false });
      if (agentId) query = query.eq("agent_id", agentId);
      const { data, error } = await query;
      if (error) throw error;
      return data as AiTrainingExample[];
    },
  });
}

export function useCreateTrainingExample() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      agent_id: string;
      user_input: string;
      ideal_output: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("ai_training_examples")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as AiTrainingExample;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-training-examples"] }),
  });
}

export function useDeleteTrainingExample() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_training_examples").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-training-examples"] }),
  });
}

export function useTrainingRuns(agentId?: string) {
  return useQuery({
    queryKey: ["ai-training-runs", agentId ?? "all"],
    queryFn: async (): Promise<AiTrainingRun[]> => {
      let query = supabase
        .from("ai_training_runs")
        .select("*")
        .order("created_at", { ascending: false });
      if (agentId) query = query.eq("agent_id", agentId);
      const { data, error } = await query;
      if (error) throw error;
      return data as AiTrainingRun[];
    },
  });
}

export function useCreateTrainingRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { agent_id: string; name: string; notes?: string }) => {
      const { data, error } = await supabase
        .from("ai_training_runs")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as AiTrainingRun;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-training-runs"] }),
  });
}

// ---------------- SOP ----------------
export type AiSop = {
  id: string;
  agent_id: string;
  title: string;
  purpose: string | null;
  steps: string[];
  output: string | null;
  sort: number;
  created_at: string;
  updated_at: string;
};

export function useAiSops(agentId?: string) {
  return useQuery({
    queryKey: ["ai-sops", agentId ?? "all"],
    queryFn: async (): Promise<AiSop[]> => {
      let query = supabase.from("ai_sops").select("*").order("sort", { ascending: true });
      if (agentId) query = query.eq("agent_id", agentId);
      const { data, error } = await query;
      if (error) throw error;
      return data as AiSop[];
    },
  });
}

export type SopInput = {
  agent_id: string;
  title: string;
  purpose?: string;
  steps?: string[];
  output?: string;
  sort?: number;
};

export function useCreateAiSop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SopInput) => {
      const { data, error } = await supabase.from("ai_sops").insert(input).select().single();
      if (error) throw error;
      return data as AiSop;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-sops"] }),
  });
}

export function useUpdateAiSop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<SopInput> & { id: string }) => {
      const { id, ...rest } = input;
      const { data, error } = await supabase
        .from("ai_sops")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as AiSop;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-sops"] }),
  });
}

export function useDeleteAiSop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_sops").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-sops"] }),
  });
}

// ---------------- SETTINGS ----------------
export type AiSetting = { key: string; value: string; updated_at: string };

export function useAiSettings() {
  return useQuery({
    queryKey: ["ai-settings"],
    queryFn: async (): Promise<Record<string, string>> => {
      const { data, error } = await supabase.from("ai_settings").select("key, value");
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const row of data as AiSetting[]) map[row.key] = row.value;
      return map;
    },
  });
}

export function useUpsertAiSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { key: string; value: string }) => {
      const { error } = await supabase
        .from("ai_settings")
        .upsert({ key: input.key, value: input.value }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-settings"] }),
  });
}

// ---------------- PROVIDERS ----------------
export type AiProvider = {
  key: string;
  name: string;
  base_url: string;
  api_key: string;
  models: string;
  enabled: boolean;
  updated_at: string;
};

export function useAiProviders() {
  return useQuery({
    queryKey: ["ai-providers"],
    queryFn: async (): Promise<AiProvider[]> => {
      const { data, error } = await supabase.from("ai_providers").select("*");
      if (error) throw error;
      const order = ["anthropic", "google", "openrouter", "openai", "custom"];
      return (data as AiProvider[]).sort(
        (a, b) => order.indexOf(a.key) - order.indexOf(b.key),
      );
    },
  });
}

export function useUpdateAiProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Partial<Omit<AiProvider, "updated_at">> & { key: string },
    ) => {
      const { key, ...rest } = input;
      const { error } = await supabase.from("ai_providers").update(rest).eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-providers"] }),
  });
}
