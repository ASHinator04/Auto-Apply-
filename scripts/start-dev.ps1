param()

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function Require-Command {
  param([string]$Name)

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command '$Name' was not found in PATH."
  }
}

Require-Command "pnpm"
Require-Command "uv"

Write-Host "Starting Job Agent development servers..." -ForegroundColor Cyan
Write-Host "Web: http://localhost:3000" -ForegroundColor DarkGray
Write-Host "API: http://localhost:8000/health" -ForegroundColor DarkGray

pnpm dev
