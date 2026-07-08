#!/usr/bin/env bash
# Setup awal VPS Ubuntu/Debian untuk baboo.id (Node 22 + PM2 + Caddy).
# Jalankan sebagai root atau user dengan sudo: bash deploy/setup-vps.sh
set -euo pipefail

APP_DIR=/var/www/babooid
REPO_URL="${REPO_URL:-https://github.com/pomahguesthouse-cyber/babooid.git}"

echo "== 1. Install Node.js 22 =="
if ! command -v node >/dev/null || [[ "$(node -v)" != v22* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "== 2. Install PM2 =="
sudo npm install -g pm2

echo "== 3. Install Caddy =="
if ! command -v caddy >/dev/null; then
  sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
  sudo apt-get update && sudo apt-get install -y caddy
fi

echo "== 4. Clone repo =="
if [[ ! -d "$APP_DIR" ]]; then
  sudo mkdir -p "$APP_DIR" && sudo chown "$USER" "$APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

echo "== 5. Cek .env =="
if [[ ! -f .env ]]; then
  echo "!! Buat $APP_DIR/.env dulu (lihat .env.example), lalu jalankan ulang skrip ini."
  exit 1
fi

echo "== 6. Build =="
npm ci
npm run build

echo "== 7. Jalankan via PM2 =="
set -a; source .env; set +a
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME" | tail -1 | sudo bash || true

echo "== 8. Pasang Caddyfile =="
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy

echo "== Selesai. Arahkan DNS A baboo.id ke IP VPS ini. =="
