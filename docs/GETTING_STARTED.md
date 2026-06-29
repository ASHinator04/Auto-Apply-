# Getting Started

This guide is the first-run path for a new contributor.

## 1. Clone

```powershell
git clone https://github.com/ASHinator04/Auto-Apply-.git
cd "Auto-Apply-"
```

If working from the existing local workspace:

```powershell
cd "D:\Codex\Jobs with Structure"
```

## 2. Install Tools

Required:

- Node.js 24
- pnpm 11
- Python 3.13
- uv

Optional:

- Docker Desktop for container builds.
- VS Code with the recommended extensions from `.vscode/extensions.json`.

## 3. Bootstrap

```powershell
pnpm bootstrap
```

This runs `pnpm install` and `uv sync`.

## 4. Configure Environment

Copy the example if local overrides are needed:

```powershell
Copy-Item .env.example .env
```

The defaults are enough for local development.

Resume metadata and knowledge base entries are stored at `.job-agent/job-agent.sqlite3` by default.
This local state is ignored by Git.

## 5. Run Locally

Run both services:

```powershell
pnpm dev
```

Run one surface:

```powershell
pnpm dev:web
pnpm dev:api
```

Local URLs:

- Web: `http://localhost:3000`
- API health: `http://localhost:8000/health`
- API version: `http://localhost:8000/version`
- Knowledge API: `http://localhost:8000/knowledge`

## 6. Verify

```powershell
pnpm verify
```

This checks formatting, linting, type checking, tests, and build.

## 7. Docker

Start Docker Desktop first, then run:

```powershell
docker compose build
docker compose up
```

Docker is not required for day-to-day local development yet.
