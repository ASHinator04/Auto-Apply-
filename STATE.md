# Repository State

## Current Phase

0C: Shared Contracts and Core Domain Definitions.

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

## Current Stack

Implemented infrastructure: Next.js, TypeScript, Tailwind CSS, shadcn/ui configuration, FastAPI, uv,
Ruff, Pyright, Vitest, pytest, ESLint, Prettier, pnpm workspaces, Docker Compose configuration,
Markdown documentation, and GitHub Actions.

Recommended but not yet implemented as product capability: SQLite persistence boundary and future
Playwright automation.

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

## Next Phase

0D: Developer Experience.

## Blocked By

User approval is required before Phase 0D begins. Docker build verification requires Docker Desktop
or an equivalent Docker daemon to be running.
