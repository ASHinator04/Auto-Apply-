# Job Agent

Job Agent is an AI-powered job application engine. The product will eventually help users manage
resumes, discover software engineering jobs, review normalized listings, approve applications, reuse
application answers, and track application status.

## Current Status

Current status: Phase 3.7 search engine certification and release audit are complete. Phase 4 has
not started and requires explicit approval.

Implemented so far:

- Knowledge Base and Resume Management dashboard in `apps/web`.
- FastAPI knowledge base and resume management APIs in `services/api`.
- Canonical TypeScript contracts in `contracts/domain`.
- Provider-independent search orchestration and plugin framework in `packages/domain`.
- Search result aggregation, normalization, validation, deduplication, quality filtering, ranking,
  unified response processing, and certified end-to-end search execution in `packages/domain`.
- Greenhouse, Lever, and Ashby raw search connectors in `packages/providers`.
- Shared workspace package in `packages/shared`.
- Linting, formatting, type checking, tests, build, Docker Compose config, CI, and VS Code support.

Implemented product scope is intentionally limited to resume management and knowledge base CRUD.
Search UI, persistence, automation, AI, and application workflows remain out of scope.

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

- `apps/web`: Next.js dashboard for knowledge base and resume management.
- `services/api`: FastAPI backend with health, version, resume, and knowledge endpoints.
- `contracts/domain`: canonical `@job-agent/contracts` package.
- `packages/domain`: provider-independent search orchestration and plugin framework.
- `docs/search`: search result processing pipeline documentation.
- `packages/providers`: provider connector infrastructure and raw Greenhouse/Lever/Ashby connectors.
- `packages/shared`: small shared TypeScript package.
- `docs`: supporting docs and phase reports.
- `scripts`: local developer automation.
- `specs`: future feature specifications.
- `playbooks`: repeatable engineering procedures.

## More Docs

- [API Reference](docs/API.md)
- [Getting Started](docs/GETTING_STARTED.md)
- [Contributing](docs/CONTRIBUTING.md)
- [Engineering Guide](ENGINEERING_GUIDE.md)
- [Project Plan](PROJECT_PLAN.md)
- [Current State](STATE.md)
- [MVP Status](MVP_STATUS.md)
- [Search Engine Release Audit](docs/PHASE_3_7_RELEASE_AUDIT.md)
- [Local QA Reset and Seed](playbooks/local-qa-reset-seed.md)
- [Browser Smoke Test](playbooks/browser-smoke-test.md)
