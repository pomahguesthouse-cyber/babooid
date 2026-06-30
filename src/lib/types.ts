import type { AgentKey } from "./agents";

export type ProjectStatus = "aktif" | "arsip" | "selesai";

export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};

export type ProjectFile = {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  storage_path: string;
  size_bytes: number;
  mime_type: string | null;
  created_at: string;
};

export type Message = {
  id: string;
  project_id: string;
  user_id: string;
  role: "user" | "assistant";
  agent: AgentKey;
  content: string;
  created_at: string;
};
