# Repository State

## Current Phase

Phase 3.2 provider plugin framework architecture review complete. Phase 3.3 has not started.

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
- Phase 2 review hardening for duplicate validation, section-label search, edit cancellation,
  empty-search messaging, accessibility, and edge-case coverage.
- Phase 3.1 provider-independent search engine foundation with search configuration, provider
  registry, lifecycle pipeline, orchestration service, tests, and documentation.
- Phase 3.1 architecture review hardening with explicit pipeline stage definitions, lifecycle
  recorder, stable per-execution request correlation, injectable duration measurement, added tests,
  and review documentation.
- Phase 3.2 provider plugin framework with plugin metadata, capability validation, plugin discovery,
  lifecycle management, enable/disable support, plugin configuration, registry handoff, tests, and
  documentation.
- Phase 3.2 review hardening for lifecycle transition validation, immutable registry descriptors,
  future capability validation, feature flag validation, tests, and review documentation.

## Current Stack

Implemented infrastructure: Next.js, TypeScript, Tailwind CSS, shadcn/ui configuration, FastAPI, uv,
Ruff, Pyright, Vitest, pytest, ESLint, Prettier, pnpm workspaces, SQLite metadata storage, Docker
Compose configuration, Markdown documentation, and GitHub Actions.

Implemented product capability: resume metadata management and user knowledge base CRUD only.
Implemented search capability: provider-independent orchestration and provider plugin framework
only; no concrete job providers exist yet.

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
- Search orchestration lives in `packages/domain` and depends on contracts, not concrete providers,
  storage, browser automation, or network clients.
- Phase 3.1 pipeline stages are explicit and documented so later phases can insert provider adapter,
  normalization, ranking, caching, and storage boundaries without redesign.
- Provider plugins expose metadata and lifecycle independently from execution; the search engine can
  receive ready providers through registry handoff without knowing provider implementation details.
- Provider plugin lifecycle transitions are validated so plugins cannot be initialized while
  disabled, re-enabled after shutdown, shutdown before readiness, or disabled while ready.

## Next Phase

Phase 3.3: Greenhouse Provider, after explicit user approval.

## Blocked By

User approval is required before Phase 3.3 begins.
