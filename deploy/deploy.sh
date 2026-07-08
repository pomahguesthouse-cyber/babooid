#!/usr/bin/env bash
# Redeploy: jalankan di VPS setiap ada update kode.
set -euo pipefail
cd /var/www/babooid
git pull
npm ci
npm run build
set -a; source .env; set +a
pm2 restart babooid --update-env

# Sinkronkan Caddyfile