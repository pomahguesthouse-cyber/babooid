import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Message, Project, ProjectFile } from "./types";

const BUCKET = "project-files";

// ---------------- PROJECTS ----------------
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async (): Promise<Project> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Project;
    },
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      location?: string;
      owner_name?: string;
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("Belum masuk.");
      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: input.name,
          description: input.description ?? null,
          location: input.location ?? null,
          owner_name: input.owner_name ?? null,
          user_id: userId,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      name?: string;
      description?: string | null;
      location?: string | null;
      owner_name?: string | null;
      status?: Project["status"];
    }) => {
      const { id, ...patch } = input;
      const { data, error } = await supabase
        .from("projects")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Project;
    },
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["project", p.id] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Hapus file di storage dulu (folder user/project).
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (userId) {
        const prefix = `${userId}/${id}`;
        const { data: list } = await supabase.storage.from(BUCKET).list(prefix);
        if (list && list.length) {
          await supabase.storage
            .from(BUCKET)
            .remove(list.map((o) => `${prefix}/${o.name}`));
        }
      }
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

// ---------------- FILES ----------------
export function useProjectFiles(projectId: string) {
  return useQuery({
    queryKey: ["files", projectId],
    queryFn: async (): Promise<ProjectFile[]> => {
      const { data, error } = await supabase
        .from("project_files")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProjectFile[];
    },
    enabled: Boolean(projectId),
  });
}

export function useUploadFile(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("Belum masuk.");

      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `${userId}/${projectId}/${Date.now()}_${safeName}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;

      const { data, error } = await supabase
        .from("project_files")
        .insert({
          project_id: projectId,
          user_id: userId,
          name: file.name,
          storage_path: path,
          size_bytes: file.size,
          mime_type: file.type || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as ProjectFile;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files", projectId] }),
  });
}

export function useDeleteFile(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: ProjectFile) => {
      await supabase.storage.from(BUCKET).remove([file.storage_path]);
      const { error } = await supabase.from("project_files").delete().eq("id", file.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files", projectId] }),
  });
}

/** URL bertanda-tangan (bucket privat) untuk membuka/unduh file. */
export async function getFileUrl(storagePath: string): Promise<string | null> {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 60);
  return data?.signedUrl ?? null;
}

// ---------------- MESSAGES / MANDOR ----------------
export function useMessages(projectId: string) {
  return useQuery({
    queryKey: ["messages", projectId],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: Boolean(projectId),
  });
}

export function useSendToMandor(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => {
      const { data, error } = await supabase.functions.invoke("baboo-mandor", {
        body: { projectId, message },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { message: Message };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages", projectId] }),
  });
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
