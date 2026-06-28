# Job Agent

## Product Mission

Build an AI-powered Job Application Engine that enables users to:

- Upload one or more resumes.
- Search the latest software engineering jobs across supported platforms.
- Display normalized jobs in a dashboard.
- Allow bulk approval of selected jobs.
- Automatically apply using browser automation.
- Store reusable application answers in a knowledge base.
- Track every application throughout its lifecycle.

## Current Phase

Phase 0B.2 implements engineering infrastructure only. Product features are intentionally not
implemented yet.

## Local Development

Install dependencies:

```powershell
pnpm install
uv sync
```

Run the frontend and backend together:

```powershell
pnpm dev
```

Run verification:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run with Docker after Docker Desktop is running:

```powershell
docker compose up --build
```
