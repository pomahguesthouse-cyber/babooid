// PM2 config — jalankan dengan: pm2 start deploy/ecosystem.config.cjs
// Env dibaca dari /var/www/babooid/.env oleh dotenv saat build; untuk runtime SSR
// nilai SUPABASE_* di bawah diisi dari environment saat pm2 start (lihat setup-vps.sh).
module.exports = {
  apps: [
    {
      name: "babooid",
      script: ".output/server/index.mjs",
      cwd: "/var/www/babooid",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOST: "127.0.0.1",
      },
      max_memory_restart: "512M",
      autorestart: true,
    },
  ],
};
