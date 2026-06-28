# Phase 0B.1 Technical Architecture and Infrastructure Design

## 1. Executive Summary

Phase 0B.1 finalizes the technical architecture before implementation. The project will use a simple
monorepo with a Next.js frontend, FastAPI backend, TypeScript shared contracts, Python service
boundaries, SQLite for MVP persistence, Playwright for future browser automation, and Docker Compose
for local orchestration. No application code is created in this phase.

The design favors free local operation, clear module ownership, low cognitive load for junior
engineers, and stable contracts between frontend, backend, domain, services, and adapters.

## 2. Technical Decisions

| Layer                 | Choice                                        | Why                                                                                                      |
| --------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Frontend              | Next.js with TypeScript                       | Matches the approved plan and gives routing, typing, and future deployment without extra infrastructure. |
| Backend               | FastAPI                                       | Simple Python API framework with strong Pydantic validation and easy local development.                  |
| Shared Libraries      | TypeScript packages plus documented contracts | Keeps frontend-facing contracts explicit while preserving backend/frontend separation.                   |
| Database              | SQLite                                        | Free, local-first, sufficient for the MVP, and easy to migrate behind a persistence boundary.            |
| Browser Automation    | Playwright                                    | Reliable cross-browser automation for Phase 6; not installed or scripted in 0B.1.                        |
| Testing               | Vitest and pytest                             | Fast, common tooling for TypeScript and Python.                                                          |
| Linting               | ESLint and Ruff                               | Standard TypeScript/Next.js linting plus fast Python linting.                                            |
| Formatting            | Prettier and Ruff format                      | Familiar formatting with clear ecosystem ownership.                                                      |
| Package Managers      | pnpm and uv                                   | Fast, deterministic, workspace-friendly tools.                                                           |
| Workspace Management  | pnpm workspaces                               | Simple monorepo layout for apps and TypeScript packages.                                                 |
| Build Tooling         | Next.js build and Python module execution     | Avoids custom build complexity before it is needed.                                                      |
| Containerization      | Docker Compose                                | Free local orchestration for frontend, backend, and future services.                                     |
| Logging               | Structured JSON backend logs                  | Enables request and workflow correlation without paid observability.                                     |
| Configuration         | Pydantic Settings and `.env.local`            | Validated backend config plus standard Next.js local config.                                             |
| Environment Variables | `.env.example` templates                      | Documents required values without committing secrets.                                                    |
| Documentation         | Markdown in repository                        | Reviewable, AI-friendly, and low cost.                                                                   |
| CI/CD                 | GitHub Actions                                | Standard GitHub integration and free for typical small-project use.                                      |
| Future Deployment     | Vercel frontend; Fly.io or Render backend     | Low-friction options, deferred until MVP deployment planning.                                            |

## 3. Repository Architecture

Expected major tree:

```text
apps/web
services/api
services/job-discovery
services/application-runner
packages/domain
packages/providers
packages/automation
packages/persistence
packages/shared
contracts/api
contracts/domain
contracts/events
contracts/adapters
specs/resume
specs/search
specs/knowledge-base
specs/automation
specs/dashboard
specs/tracking
specs/shared
experiments/llm
experiments/embeddings
experiments/prompts
experiments/benchmarks
experiments/browser
tests/contract
tests/integration
tests/e2e
config/env
scripts
playbooks
docs
```

Ownership:

- `apps/web`: presentation, routing, UI state, and backend calls.
- `services/api`: FastAPI app, HTTP boundary, health endpoint, and request validation.
- `services/job-discovery`: future job discovery orchestration.
- `services/application-runner`: future approved application orchestration.
- `packages/domain`: framework-independent business rules.
- `packages/providers`: job platform adapter boundaries.
- `packages/automation`: future Playwright automation abstractions.
- `packages/persistence`: storage abstractions and implementations.
- `packages/shared`: small reusable utilities with real shared ownership.
- `contracts`: shared API, domain, event, and adapter interfaces.
- `specs`: module-specific product and workflow requirements.
- `experiments`: research isolated from production dependencies.

## 4. Dependency Graph

Allowed direction:

```text
apps/web -> contracts/api -> contracts/domain
services/api -> contracts/* -> packages/domain -> packages/persistence
services/job-discovery -> contracts/* -> packages/domain -> packages/providers -> packages/persistence
services/application-runner -> contracts/* -> packages/domain -> packages/automation -> packages/persistence
packages/providers -> contracts/adapters -> contracts/domain
packages/automation -> contracts/adapters -> contracts/domain
packages/persistence -> contracts/domain
packages/domain -> contracts/domain
```

Rules:

- Circular dependencies are forbidden.
- UI must not depend on service internals.
- Domain must not depend on UI, database engines, browser automation, provider SDKs, or web
  frameworks.
- Contracts must not depend on implementation packages.
- Experiments must never become production dependencies by accident.

## 5. Infrastructure Design

Monorepo: use `pnpm` workspaces for JavaScript/TypeScript and `uv` for Python services. Version the
repository as one product until package publishing is required.

Configuration: commit `.env.example` only. Keep `.env` and `.env.local` untracked. Validate backend
configuration on startup with Pydantic Settings. Use dedicated test configuration and temporary
storage for tests.

Logging: backend logs should be structured JSON with `timestamp`, `level`, `message`, `service`,
`request_id`, `correlation_id`, and safe metadata. Never log resumes, secrets, tokens, full
application answers, or browser session data.

Testing: unit tests live near modules where practical; cross-module tests live under `tests/`. Use
`*.test.ts` for TypeScript and `test_*.py` for Python. Prioritize meaningful coverage for domain
rules, contracts, configuration validation, and error paths.

Error handling: domain errors describe business rule failures; validation errors describe malformed
input; infrastructure errors wrap external failures; user-facing errors must be safe and actionable.
Retry only transient provider, network, or automation failures with bounded attempts.

Expected local commands after Phase 0B.2:

```powershell
pnpm install
pnpm dev
pnpm test
pnpm lint
pnpm format
uv sync
uv run pytest
docker compose up --build
```

## 6. Risks

- Browser automation: provider markup changes, CAPTCHA, and bot defenses. Mitigate with adapters,
  explicit approval, audit logs, and provider capability flags.
- Job providers: API or site changes may break discovery. Mitigate with contract tests and isolated
  adapters.
- Rate limiting: discovery can be throttled. Mitigate with conservative scheduling, backoff, and
  clear failure states.
- Knowledge base growth: answers can become stale or contradictory. Mitigate with provenance,
  editing workflow, and user approval.
- LLM abstraction: providers vary in cost, quality, and privacy posture. Mitigate through
  experiments and evaluation fixtures before production use.
- Scaling: SQLite may eventually be insufficient. Mitigate with persistence abstractions and a
  planned Postgres migration path.

## 7. Updated Documentation

This phase updates `ARCHITECTURE.md`, `ENGINEERING_GUIDE.md`, `ROADMAP.md`, `DECISIONS.md`,
`STATE.md`, and `TODO.md`. `PROJECT_PLAN.md` is treated as the governing phase plan.

## 8. Recommended Stack

Use Next.js, TypeScript, Tailwind CSS, shadcn/ui, FastAPI, uv, Ruff, Pyright, SQLite, Playwright,
Vitest, pytest, ESLint, Prettier, pnpm workspaces, Docker Compose, Markdown documentation, GitHub
Actions, and deferred low-cost deployment selection.

## 9. Open Questions

- Should Phase 0B.2 add `services/api` only, or also preserve empty worker service folders?
- Should Phase 0C contracts be authored first in TypeScript, Python, or language-neutral
  Markdown/JSON Schema?
- Which remote Git repository should receive phase commits?
- Should deployment stay local-only until Phase 10, or should Vercel plus Fly.io/Render be prepared
  earlier?

## 10. Implementation Plan for Phase 0B.2

1. Confirm the approved stack and open questions.
2. Add monorepo configuration without product pages or business logic.
3. Add Next.js app shell only within approved Phase 0B scope.
4. Add FastAPI service with health endpoint only.
5. Add formatting, linting, type checking, and test commands.
6. Add Docker Compose for local frontend/backend startup.
7. Add CI skeleton that runs lint and tests.
8. Update docs, commit, push, and stop for review.

## Phase Verification

- No production code was created.
- No dependencies were installed.
- No frontend pages, backend APIs beyond future design, database models, Playwright scripts, or
  business logic were created.
- Every recommendation is justified here or in `DECISIONS.md`.
- The repository is ready for Phase 0B.2 after user approval.
