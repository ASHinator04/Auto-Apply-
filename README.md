# Job Agent

Job Agent is an AI-powered job application engine. The product will eventually help users manage
resumes, discover software engineering jobs, review normalized listings, approve applications, reuse
application answers, and track application status.

## Current Status

Current status: Phase 0 complete. Phase 1 resume management is pending explicit approval.

Implemented so far:

- Next.js frontend shell in `apps/web`.
- FastAPI backend shell in `services/api`.
- Canonical TypeScript contracts in `contracts/domain`.
- Shared workspace package in `packages/shared`.
- Linting, formatting, type checking, tests, build, Docker Compose config, CI, and VS Code support.

Product features are intentionally not implemented yet.

## Quick Start

Prerequisites:

- Node.js 24
- pnpm 11
- Python 3.13
- uv
- Docker Desktop, optional for container verification

Bootstrap the repo:

```powershell
pnpm bootstrap
```

Run both development servers:

```powershell
pnpm dev
```

Run the full health check:

```powershell
pnpm verify
```

Run with Docker after Docker Desktop is running:

```powershell
docker compose up --build
```

## Common Commands

| Command          | Purpose                                                       |
| ---------------- | ------------------------------------------------------------- |
| `pnpm bootstrap` | Install JavaScript and Python dependencies.                   |
| `pnpm dev`       | Run frontend and backend together.                            |
| `pnpm dev:web`   | Run only the Next.js app.                                     |
| `pnpm dev:api`   | Run only the FastAPI service.                                 |
| `pnpm verify`    | Format check, lint, typecheck, test, and build.               |
| `pnpm lint`      | Run TypeScript and Python linting.                            |
| `pnpm typecheck` | Run TypeScript and Python type checks.                        |
| `pnpm test`      | Run all tests.                                                |
| `pnpm build`     | Build TypeScript packages, web app, and Python compile check. |
| `pnpm clean`     | Remove generated local build/cache outputs.                   |

## Repository Structure

- `apps/web`: Next.js frontend shell.
- `services/api`: FastAPI backend shell.
- `contracts/domain`: canonical `@job-agent/contracts` package.
- `packages/shared`: small shared TypeScript package.
- `docs`: supporting docs and phase reports.
- `scripts`: local developer automation.
- `specs`: future feature specifications.
- `playbooks`: repeatable engineering procedures.

## More Docs

- [Getting Started](docs/GETTING_STARTED.md)
- [Contributing](docs/CONTRIBUTING.md)
- [Engineering Guide](ENGINEERING_GUIDE.md)
- [Project Plan](PROJECT_PLAN.md)
- [Current State](STATE.md)
