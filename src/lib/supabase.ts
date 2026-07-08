// Client Supabase — URL & kunci publik dibaca dari .env (lihat .env.example).
// (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY) — tidak perlu .env manual.
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as supabaseClient } from "@/integrations/supabase/client";

// Diekspor sebagai SupabaseClient generik supaya query ke tabel kustom
// (projects, project_files, messages) tetap lolos typecheck sebelum
export const supabase = supabaseClient as unknown as SupabaseClient;

export const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL);
