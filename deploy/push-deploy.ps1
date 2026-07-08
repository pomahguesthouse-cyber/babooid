# Push & deploy sekali jalan — jalankan dari laptop (PowerShell):
#   .\deploy\push-deploy.ps1
# Ganti $VpsHost sekali di bawah, atau override:
#   .\deploy\push-deploy.ps1 -VpsHost root@1.2.3.4
param(
  [string]$VpsHost = "root@IP-VPS-ANDA"
)

$ErrorActionPreference = "Stop"

if ($VpsHost -eq "root@IP-VPS-ANDA") {
  Write-Host "Edit dulu deploy/push-deploy.ps1: ganti IP-VPS-ANDA dengan IP VPS Anda." -ForegroundColor Yellow
  exit 1
}

# Selalu jalan dari root repo
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "[1/2] git push..." -ForegroundColor Cyan
git push
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "[2/2] deploy di VPS ($VpsHost)..." -ForegroundColor Cyan
ssh $VpsHost "cd /var/www/babooid && bash deploy/deploy.sh"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Selesai. Cek https://baboo.id dan https://ai.baboo.id/admin" -ForegroundColor Green
