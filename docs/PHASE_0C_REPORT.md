# Phase 0C Report

## Executive Summary

Phase 0C defines the shared language of the Job Agent system. It adds the `@job-agent/contracts`
TypeScript package under `contracts/domain` with canonical domain models, DTOs, enums, error shapes,
and framework-independent interfaces. No product workflow, persistence, provider adapter, UI
feature, worker, AI provider, or browser automation was implemented.

The FastAPI infrastructure shell was also adjusted so Pydantic response schemas live in
`services/api/src/job_agent_api/schema.py`.

## Repository Changes

- Added `contracts/domain/package.json`, `tsconfig.json`, `vitest.config.ts`, and `src/`.
- Added contract exports for models, DTOs, enums, errors, and interfaces.
- Added contract tests for compilation, import validity, serialization, enum stability, and
  framework-independent error shapes.
- Updated root scripts so `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` include
  `@job-agent/contracts`.
- Moved FastAPI `HealthResponse` into `schema.py`.
- Updated repository state, architecture, engineering guidance, roadmap, TODOs, ADRs, and local
  AGENTS guidance.

## New Contracts

- Models: `Resume`, `User`, `Job`, `Provider`, `Application`, `KnowledgeEntry`, `SearchRequest`,
  `SearchResult`.
- Interfaces: `JobProvider`, `ApplicationProvider`, `ResumeStorage`, `KnowledgeRepository`,
  `ApplicationTracker`, `SearchEngine`.
- DTOs: resume, user, job search, search result, knowledge entry, application approval, application
  status, provider job inputs/outputs.
- Enums: `ApplicationStatus`, `ProviderType`, `KnowledgeEntryType`, `ResumeType`, `JobType`,
  `EmploymentType`, `WorkMode`.
- Errors: `DomainError`, `ValidationError`, `ProviderError`, `AutomationError`, `KnowledgeError`,
  `ConfigurationError`, `JobAgentError`.

## Dependency Verification

`@job-agent/contracts` has no runtime dependencies and does not import FastAPI, Next.js, React,
Playwright, SQLite, SQLAlchemy, browser APIs, or implementation packages. The package compiles on
its own and is included in root lint, typecheck, test, and build commands.

## Test Results

Phase verification commands:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Docker verification remains dependent on Docker Desktop being available locally.

## Documentation Updated

- `AGENTS.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `ENGINEERING_GUIDE.md`
- `ROADMAP.md`
- `STATE.md`
- `TODO.md`
- `contracts/domain/AGENTS.md`
- `services/api/AGENTS.md`

## Known Limitations

- Contracts are TypeScript-first. Python runtime validation models are not generated or mirrored
  yet.
- Contracts intentionally do not validate business rules.
- Provider-specific fields remain outside canonical models until provider adapters are implemented.
- Docker build verification is still pending a running Docker daemon.

## Recommendations for Phase 0D

- Improve developer ergonomics around contract discovery and generation.
- Decide whether Python schemas should be generated from TypeScript contracts or maintained as a
  separate mirrored layer.
- Add a lightweight dependency-boundary check if the project needs stronger circular-dependency
  enforcement.
- Verify Docker build once Docker Desktop is running.
