# Repository State

## Current Phase

Phase 4.3 Job Details & Evaluation complete. Phase 4.4 has not started.

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
- Phase 3.3 Greenhouse provider plugin, HTTP client, request builder, response parser, raw job
  model, filter handling, retry handling, pagination support, registration helpers, tests, and
  documentation.
- Phase 3.3 review hardening for invalid JSON classification, same-origin pagination validation,
  abort-style timeout detection, raw payload snapshotting, added tests, and review documentation.
- Phase 3.4 Lever provider plugin, HTTP client, request builder, response parser, raw job model,
  filter handling, retry handling, skip/limit pagination support, registration helpers, tests, and
  documentation.
- Phase 3.4 review hardening with shared provider JSON request/retry infrastructure, cross-provider
  consistency documentation, implementation guide, tests, and review report.
- Post-smoke QA hardening for Activity Log hydration, stable dashboard test selectors, README
  status, local reset/seed workflow, and browser smoke-test playbook.
- Phase 3.5 Ashby provider plugin, public postings connector, HTTP client, request builder, response
  parser, raw job model, local filters, registration helpers, tests, provider implementation guide,
  and documentation.
- Phase 3.5 provider ecosystem certification review with provider guide hardening, parser empty
  response coverage, Greenhouse comment/error consistency cleanup, and certification report.
- Phase 3.6 stateless search result processing pipeline with aggregation, normalization, validation,
  deduplication, quality filtering, deterministic ranking, unified response metadata, tests, and
  documentation.
- Phase 3.6 review certification with transitive duplicate-group hardening, metadata validation
  hardening, provider-specific normalization file split, regression tests, and certification report.
- Phase 3.7 final search engine certification with `SearchService.searchUnified`, provider plugin
  configuration handoff, end-to-end provider/pipeline certification tests, failure certification,
  and final certification report.
- Phase 3.7 release audit with provider-specific timeout enforcement, duplicate-heavy deduplication
  coverage, MVP status documentation, and release audit report.
- Phase 4.1 search experience foundation with Search tab, resume selector, search criteria form,
  Next.js `/api/search` route, unified search response execution, loading/error/empty/no-results
  states, retry control, tests, and documentation.
- Phase 4.1 review hardening for malformed search payload validation, native keyword validation,
  focused error state accessibility, route validation coverage, browser workflow verification, and
  review documentation.
- Phase 4.2 Job Browser with canonical job cards, provider badges, client-side filtering, sorting,
  pagination, individual selection, visible-job selection, clear selection, tests, and
  documentation.
- Phase 4.2 review hardening for deterministic sort tie-breakers, invalid pagination state,
  response-change selection reset, added regression tests, and review documentation.
- Phase 4.3 read-only Job Details view with canonical job metadata, description, compensation,
  provider information, external source URL, selection synchronization, browser return navigation,
  missing-job handling, tests, and documentation.

## Current Stack

Implemented infrastructure: Next.js, TypeScript, Tailwind CSS, shadcn/ui configuration, FastAPI, uv,
Ruff, Pyright, Vitest, pytest, ESLint, Prettier, pnpm workspaces, SQLite metadata storage, Docker
Compose configuration, Markdown documentation, and GitHub Actions.

Implemented product capability: resume metadata management, user knowledge base CRUD, initial search
execution experience, client-side job browsing/selection, and read-only job inspection. Implemented
search capability: provider-independent orchestration, provider plugin framework, Greenhouse raw
search connector, Lever raw search connector, Ashby raw search connector, stateless search result
processing pipeline, and certified end-to-end unified search execution only.

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
- Greenhouse search returns raw provider-specific job objects. Provider modules do not normalize,
  deduplicate, rank, cache, store, or integrate dashboard behavior.
- Greenhouse pagination follows only the configured Greenhouse API origin, invalid JSON is a
  non-retryable connector error, and parser raw payloads are shallow snapshots.
- Lever search returns raw provider-specific posting objects. Lever uses skip/limit pagination,
  supports API-side filters for location, team, department, and commitment, and handles unsupported
  keyword/remote filtering locally where raw fields allow it.
- Greenhouse and Lever share provider-agnostic JSON HTTP retry, timeout, rate-limit, invalid JSON,
  and abort-style timeout handling through `packages/providers/src/shared`.
- Ashby search returns raw provider-specific posting objects from the public job board API. Provider
  modules do not normalize, deduplicate, rank, cache, store, or integrate dashboard behavior.
- Greenhouse, Lever, and Ashby now follow the provider implementation guide in
  `specs/providers/PROVIDER_IMPLEMENTATION_GUIDE.md`.
- Phase 3.6 processing lives in `packages/domain/src/search/processing`, remains stateless, and does
  not import concrete provider modules.
- Search result deduplication is exact and deterministic, including transitive exact-key duplicate
  groups. AI, embeddings, fuzzy matching, caching, persistence, and dashboard integration remain out
  of scope.
- `SearchService.searchUnified` is the certified Phase 3 search consumption boundary. Future
  dashboard and workflow phases should consume `UnifiedSearchResponse`, not provider raw models.
- `ProviderPluginRegistry.createSearchConfigurationInput` preserves ready provider priorities and
  plugin configuration when handing providers to `SearchService`.
- `SearchService` enforces provider-specific timeout settings when present and falls back to the
  global search timeout otherwise.
- Phase 4.1 web search execution uses only `SearchService.searchUnified` and
  `UnifiedSearchResponse`; the UI does not consume provider-specific raw models.
- Phase 4.1 review keeps Search Engine contracts unchanged and confines robustness fixes to the web
  route and presentation layer.
- Phase 4.2 Job Browser consumes only canonical jobs from `UnifiedSearchResponse`. Filtering,
  sorting, pagination, and selection are local UI state and do not create sessions, details routes,
  queues, storage, or application records.
- Phase 4.2 review keeps Search Engine and Search API boundaries unchanged. Sorting uses stable
  deterministic tie-breakers, and selection resets on new unified responses.
- Phase 4.3 Job Details reuses the current `UnifiedSearchResponse` in memory. It does not fetch
  provider data, create routes, create sessions, persist jobs, or create application records.

## Next Phase

Phase 4.4: Search Sessions, after explicit user approval.

## Blocked By

User approval is required before Phase 4.4 begins.
