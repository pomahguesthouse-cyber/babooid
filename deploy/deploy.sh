#!/usr/bin/env bash
# Redeploy: jalankan di VPS setiap ada update kode.
set -euo pipefail
cd /var/www/babooid
git pull
# npm ci butuh package-lock.json yang sinkron. Project ini dikelola dengan bun,
# jadi lock npm bisa tertinggal — fallback ke npm install agar deploy tidak macet.
npm ci --no-audit --no-fund || npm install --no-audit --no-fund
npm run build
set -a; source .env; set +a
pm2 restart babooid --update-env

# Sinkronkan Caddyfile bila berubah (mis. penambahan ai.baboo.id)
if ! cmp -s deploy/Caddyfile /etc/caddy/Caddyfile; then
  cp deploy/Caddyfile /etc/caddy/Caddyfile
  systemctl reload caddy
  echo "Caddyfile diperbarui & caddy di-reload."
fi

echo "Deploy selesai."
