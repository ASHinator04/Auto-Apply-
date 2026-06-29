# Repository State

## Current Phase

Phase 2 user knowledge base complete. Phase 3 has not started.

## Completed

- Documentation foundation.
- High-level architecture.
- Root and child `AGENTS.md` hierarchy.
- Planned `specs/`, `contracts/`, `experiments/`, and `playbooks/` structure.
- Initial ADR log and roadmap.
- Phase 0B.1 recommended stack and infrastructure design.
- Phase 0B.2 monorepo, frontend shell, backend shell, shared package, tooling, Docker/CI
  configuration, and developer experience files.
- Phase 0C canonical TypeScript contract package in `contracts/domain`.
- Phase 0D onboarding docs, command wrappers, VS Code tasks/debug profiles, Makefile aliases, and
  repository health documentation.
- Phase 0 verification audit, documentation synchronization, repository cleanup, and readiness
  report.
- Phase 1 resume management dashboard, local SQLite metadata persistence, resume APIs, validation,
  tests, and documentation.
- Phase 1 review hardening for primary consistency, validation clarity, API error handling, and
  edge-case coverage.
- Phase 2 user knowledge base dashboard, local SQLite persistence, CRUD APIs, keyword search,
  validation, tests, and documentation.

## Current Stack

Implemented infrastructure: Next.js, TypeScript, Tailwind CSS, shadcn/ui configuration, FastAPI, uv,
Ruff, Pyright, Vitest, pytest, ESLint, Prettier, pnpm workspaces, SQLite metadata storage, Docker
Compose configuration, Markdown documentation, and GitHub Actions.

Implemented product capability: resume metadata management and user knowledge base CRUD only.

Recommended but not yet implemented as product capability: future Playwright automation.

## Current Branch

`main`.

## Known Decisions

- AI-first development workflow.
- Modular architecture.
- Adapter-based integrations.
- Local-first where practical.
- Low-cost open-source first.
- Hierarchical `AGENTS.md` documentation.
- Incremental phased development.
- Git commit and push required for every phase.
- `PROJECT_PLAN.md` is the governing phase plan.
- SQLite is the initial database recommendation.
- Contracts are the cross-layer dependency boundary.
- `@job-agent/contracts` is the canonical Phase 0C contract surface.
- Resume files are validated during upload but only metadata is stored in Phase 1.
- Knowledge base entries are stored locally as editable structured text in Phase 2.

## Next Phase

Phase 3: Job Search Engine, after explicit user approval.

## Blocked By

User approval is required before Phase 3 begins.
