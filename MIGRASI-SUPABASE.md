# Migrasi dari Lovable Cloud ke Supabase Mandiri

Repo ini sudah tidak terikat layanan Lovable. Backend (database, auth, storage,
edge functions) perlu dipindah ke project Supabase milik sendiri. Ikuti urutan ini.

## 1. Buat project Supabase

1. Buka https://supabase.com → New project (region Singapore paling dekat).
2. Catat dari **Project Settings → API**: `Project URL` dan `Publishable key`.

## 2. Jalankan migration database

Di **SQL Editor**, jalankan berurutan isi file:

1. `supabase/migrations/0001_dashboard.sql`
2. `supabase/migrations/0002_try_simple.sql` (skema halaman /backend buatan Lovable — opsional)
3. `supabase/migrations/0002_ai_lab.sql`
4. `supabase/migrations/0003_cad_agent_cerdas.sql`

## 3. Setup auth

- **Google OAuth**: Authentication → Providers → Google → isi Client ID & Secret
  (buat di Google Cloud Console → Credentials → OAuth client ID, redirect URI:
  `https://<project-ref>.supabase.co/auth/v1/callback`).
- **Redirect URLs**: Authentication → URL Configuration → tambahkan
  `https://baboo.id/auth/callback` dan `https://ai.baboo.id/admin`.
- **Akun admin**: Authentication → Users → Add user → email + password,
  centang auto-confirm. Lalu di SQL Editor:

  ```sql
  insert into public.admins (user_id)
  select id from auth.users where email = 'ical.smg@gmail.com'
  on conflict do nothing;
  ```

## 4. Deploy edge functions

Dari folder project (perlu Personal Access Token dari
https://supabase.com/dashboard/account/tokens):

```bash
npx -y supabase login          # atau set SUPABASE_ACCESS_TOKEN
npx -y supabase link --project-ref <project-ref-baru>
npx -y supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
npx -y supabase functions deploy baboo-mandor
npx -y supabase functions deploy cad-agent
```

Catatan: ganti `project_id` di `supabase/config.toml` dengan project ref baru.

## 5. Update .env di VPS

Edit `/var/www/babooid/.env`:

```env
VITE_SUPABASE_URL=https://<project-ref-baru>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_URL=https://<project-ref-baru>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Lalu deploy ulang: `bash deploy/deploy.sh` (atau dari laptop: `./deploy/push-deploy.ps1`).

## 6. Putuskan koneksi di Lovable

Di lovable.dev → project babooid → Settings → GitHub → Disconnect,
agar Lovable berhenti push commit ke repo ini.

## Catatan data lama

Data di Supabase Lovable Cloud (user, proyek, chat) TIDAK ikut pindah.
Jika ada data penting, ekspor dulu lewat Lovable (Backend → Database) sebelum
memutuskan koneksi.
