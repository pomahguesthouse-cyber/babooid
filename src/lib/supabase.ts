// Memakai client Supabase yang dikelola Lovable Cloud.
// URL & kunci publik disuntikkan otomatis oleh Lovable saat build
// (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY) — tidak perlu .env manual.
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as lovableSupabase } from "@/integrations/supabase/client";

// Diekspor sebagai SupabaseClient generik supaya query ke tabel kustom
// (projects, project_files, messages) tetap lolos typecheck sebelum
// tipe database di-regenerate oleh Lovable setelah migrasi dijalankan.
export const supabase = lovableSupabase as unknown as SupabaseClient;

// Dengan Lovable Cloud, koneksi backend selalu tersedia di preview & produksi.
export const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL);
