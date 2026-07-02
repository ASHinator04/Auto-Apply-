# Architecture

## Purpose

Job Agent will be organized as a modular system for discovering jobs, preparing application data,
automating submission where appropriate, and tracking outcomes. This document describes planned
boundaries, not implementation details.

## Major Systems

- Resume ingestion: manages uploaded resumes and extracts reusable candidate facts.
- Job discovery: searches supported platforms through provider adapters.
- Job normalization: converts platform-specific listings into a consistent internal shape.
- Approval workflow: allows users to review and bulk approve target jobs.
- Application knowledge base: stores reusable answers and profile details.
- Application automation: applies to approved jobs through controlled browser automation.
- Application tracking: records status, history, evidence, and follow-up state.
- User interface: presents jobs, approvals, application state, and settings.

## Planned Modules

Future modules should be separated into applications, shared packages, services, and adapters.
Domain modules should own concepts such as jobs, resumes, applications, answers, and providers.
Adapters should isolate external websites, APIs, browser automation, and storage.

Contracts should live under `contracts/` so applications, services, providers, and automation depend
on stable interfaces rather than depending directly on each other. Research belongs under
`experiments/` until a decision promotes it into production architecture.

## Data Flow

Resumes and user profile data feed the knowledge base. Provider adapters discover job listings.
Normalization converts listings into comparable records. Users approve jobs. Approved jobs are
passed to application automation. Results and status changes return to application tracking.

## System Boundaries

The domain layer owns business rules. The UI owns presentation. Adapters own external platforms.
Automation owns browser interaction. Persistence owns storage details. No external platform should
become a required dependency of core domain logic.

## Future Extensibility

The architecture should make it possible to add job platforms, resume formats, answer sources,
automation strategies, and storage backends without rewriting the core workflow. New capabilities
should enter through documented module boundaries and adapter contracts.

## Phase 0B.1 Infrastructure Architecture

The implementation stack is designed around a low-cost monorepo:

- `apps/web`: Next.js with TypeScript, Tailwind CSS, and shadcn/ui.
- `services/api`: FastAPI backend managed with uv.
- `contracts/`: shared API, domain, event, and adapter contracts.
- `packages/`: domain, provider, automation, persistence, and shared libraries.
- `tests/`: contract, integration, and end-to-end tests.

The initial database recommendation is SQLite behind a persistence boundary. Browser automation is
reserved for a future Playwright-based automation layer and must not enter domain logic. See
`docs/PHASE_0B_1_TECHNICAL_DESIGN.md` for the full dependency graph, infrastructure strategy, and
risk assessment.

## Phase 0B.2 Implemented Infrastructure

Phase 0B.2 implements the approved infrastructure shell:

- Next.js frontend in `apps/web` with a placeholder in-development page.
- FastAPI backend in `services/api` with `/health` and `/version` only.
- Shared TypeScript package in `packages/shared`.
- pnpm workspace, uv environment, linting, formatting, type checking, tests, Docker Compose, CI, VS
  Code recommendations, EditorConfig, and environment templates.

No product features, domain entities, database schemas, provider adapters, AI providers, or browser
automation are implemented.

## Phase 0C Shared Contracts

Phase 0C introduces `@job-agent/contracts` in `contracts/domain` as the canonical TypeScript
contract package. It defines framework-independent domain models, DTOs, enums, errors, and
interfaces for resumes, users, jobs, providers, applications, knowledge entries, search requests,
search results, and future provider/storage/tracking boundaries.

Contracts must not import FastAPI, Next.js, React, Playwright, SQLite, SQLAlchemy, browser APIs, or
implementation packages. Future modules should depend on contracts rather than depending directly on
each other.

## Phase 1 Resume Management

Phase 1 implements the first product vertical slice:

- `apps/web`: resume dashboard for PDF upload, list, rename, replace, delete, and primary selection.
- `services/api`: FastAPI resume endpoints and request/response schemas.
- `services/api`: local SQLite resume metadata repository behind a small service layer.

Uploaded files are validated for PDF extension, MIME type, size, and PDF signature. Phase 1 stores
metadata only; it does not persist resume file contents, parse resumes, perform OCR, use AI, search
jobs, or automate applications.

## Phase 2 User Knowledge Base

Phase 2 adds editable user profile and reusable answer storage:

- `apps/web`: Knowledge Base dashboard with create, edit, delete, keyword search, section grouping,
  collapsible sections, short-answer inputs, and long-form text editing.
- `services/api`: FastAPI knowledge endpoints and request/response schemas.
- `services/api`: local SQLite knowledge repository behind a service layer.
- `contracts/domain`: framework-independent knowledge sections and CRUD/search DTOs.

Knowledge entries are stored as structured text with section, type, title, content, optional company
name, sort order, and timestamps. Search is simple keyword matching only. Phase 2 does not implement
AI, semantic search, embeddings, vector storage, provider adapters, job search, automation, or
authentication.

## Phase 3.1 Search Engine Foundation

Phase 3.1 adds `@job-agent/domain` in `packages/domain` as the provider-independent orchestration
layer for future job discovery. It defines:

- Search configuration for enabled providers, disabled providers, future priorities, timeouts, and
  maximum provider count.
- A provider registry that discovers registered providers without knowing their implementations.
- An explicit search lifecycle pipeline in `packages/domain/src/search/pipeline.ts`: request
  accepted, provider selection, provider execution, result collection, and response creation.
- A search service that implements the contract `SearchEngine` interface and can return diagnostics
  for orchestration tests and future observability.

The package depends on `@job-agent/contracts` and does not depend on FastAPI, Next.js, React,
Playwright, SQLite, SQLAlchemy, browser APIs, storage, HTTP clients, or concrete provider adapters.
Phase 3.1 intentionally returns empty results when no providers are registered.

Dependency direction:

```text
future provider adapters -> SearchProvider interface
SearchService -> SearchProviderRegistry -> SearchProvider interface
SearchService -> explicit pipeline lifecycle
packages/domain -> @job-agent/contracts
```

Later phases may add adapter registration, normalization, ranking, caching, or storage around these
boundaries, but they must not make the domain package depend on concrete providers or
infrastructure.

## Phase 3.2 Provider Plugin Framework

Phase 3.2 adds provider plugin infrastructure to `@job-agent/domain` without implementing any
concrete providers. Provider plugins expose metadata and lifecycle hooks independently from search
execution.

The framework defines:

- Provider metadata: id, type, display name, version, and capability flags.
- Capability validation for keyword search, pagination, location filters, remote search, salary, and
  future flags.
- Provider plugin configuration for enabled state, priority, timeout, future retry policy, and
  feature flags.
- Plugin discovery through implementation-independent discoverers.
- Plugin lifecycle: validated, disabled, ready, and shutdown.
- Registry handoff from ready plugins into the existing `SearchProviderRegistry`.
- Immutable registry descriptor snapshots so callers cannot mutate registry state through list
  results.

Dependency direction:

```text
future provider plugin -> ProviderPlugin interface -> ProviderPluginRegistry
ProviderPluginRegistry -> SearchProviderRegistry
SearchService -> SearchProviderRegistry
packages/domain -> @job-agent/contracts
```

The framework does not include Greenhouse, Lever, Ashby, HTTP requests, browser automation, HTML
parsing, normalization, deduplication, ranking, caching, dashboard code, storage, or search UI.

## Phase 3.3 Greenhouse Search Connector

Phase 3.3 adds `@job-agent/providers` in `packages/providers` and implements the first concrete
provider plugin for Greenhouse public job boards. The Greenhouse connector is provider-specific and
does not modify `SearchService`, `SearchProviderRegistry`, or `ProviderPluginRegistry`.

The Greenhouse package defines:

- Connector orchestration for raw Greenhouse searches.
- HTTP client with configurable timeout, User-Agent, retry policy, rate-limit handling, same-origin
  pagination validation, invalid JSON classification, and mocked test support.
- Request builder for the Greenhouse public jobs endpoint.
- Response parser for available Greenhouse fields only, including a shallow raw payload snapshot.
- Raw Greenhouse job model.
- Keyword, location, remote, and department filtering where available.
- Provider plugin metadata, registration, and discovery helpers.

The connector intentionally returns raw Greenhouse-specific job objects through the provider
contract bridge. Phase 3.6 owns conversion into canonical normalized jobs, deduplication, and
ranking. Caching and storage remain later-phase concerns.

Lifecycle rules:

- Disabled plugins cannot initialize.
- Ready plugins are initialized at most once.
- Ready plugins must be shutdown before they can be disabled.
- Only ready plugins can shutdown.
- Shutdown plugins cannot be re-enabled or re-initialized.

## Phase 3.4 Lever Search Connector

Phase 3.4 adds Lever as the second concrete provider plugin in `@job-agent/providers`. The Lever
connector mirrors the Greenhouse structure and does not modify `SearchService`,
`SearchProviderRegistry`, `ProviderPluginRegistry`, or shared contracts.

The Lever package defines:

- Connector orchestration for raw Lever posting searches.
- HTTP client with configurable timeout, User-Agent, retry policy, rate-limit handling, invalid JSON
  classification, and mocked test support.
- Request builder for the Lever public postings endpoint.
- Response parser for available Lever posting fields only, including a shallow raw payload snapshot.
- Raw Lever job model.
- Keyword, location, remote, team, department, and commitment filtering where available.
- Provider plugin metadata, registration, and discovery helpers.

Lever uses `skip` and `limit` query parameters for pagination. The connector continues fetching
until a page returns fewer postings than `pageSize` or `maxPages` is reached. Lever supports
location, team, department, and commitment filters through query parameters; keyword and remote
filters are handled locally when raw fields allow it.

The connector intentionally returns raw Lever-specific posting objects through the provider contract
bridge. Phase 3.6 owns aggregation, canonical normalization, deduplication, and ranking. Caching and
storage remain later-phase concerns.

## Phase 3.4 Provider Consistency Review

Greenhouse and Lever now share provider-agnostic JSON HTTP infrastructure in
`packages/providers/src/shared`. The shared helper owns timeout setup, transient retry handling,
`Retry-After` parsing, User-Agent and JSON headers, invalid JSON classification, abort-style timeout
classification, and common rate-limit/provider-down error mapping.

Provider-specific modules still own:

- Configuration defaults and validation.
- Request URL construction.
- Pagination interpretation.
- Response parsing.
- Raw provider models.
- Provider-specific filtering.
- Plugin metadata and registration.

Ashby should be implementable by adding a new provider folder that follows the same structure,
without modifying `packages/domain`, Greenhouse, or Lever.

## Phase 3.5 Ashby Search Connector and Provider Standardization

Phase 3.5 adds Ashby as the third concrete provider plugin in `@job-agent/providers` and codifies
the provider implementation pattern in `specs/providers/PROVIDER_IMPLEMENTATION_GUIDE.md`.

The Ashby package defines:

- Connector orchestration for raw Ashby public job board searches.
- HTTP client using the shared provider JSON request helper for timeout, retry, rate-limit, invalid
  JSON, and abort-style timeout handling.
- Request builder for `https://api.ashbyhq.com/posting-api/job-board/{JOB_BOARD_NAME}` with optional
  compensation inclusion.
- Response parser for available Ashby posting fields only, including secondary locations, employment
  type, listed/remote flags, compensation fields, provider metadata, and a shallow raw payload
  snapshot.
- Raw Ashby job model.
- Keyword, location, remote, team, department, and employment-type filtering where raw fields allow
  it.
- Provider plugin metadata, registration, and discovery helpers.

Ashby does not require public API pagination for this connector; the connector fetches one
board-wide JSON payload and reports one fetched page for consistency. The connector intentionally
returns raw Ashby-specific posting objects through the provider contract bridge. Phase 3.6 owns
aggregation, canonical normalization, deduplication, and ranking. Caching and storage remain
later-phase concerns.

## Phase 3.6 Search Result Processing Pipeline

Phase 3.6 adds a stateless provider-independent processing pipeline in
`packages/domain/src/search/processing`. It does not modify `SearchService`,
`SearchProviderRegistry`, `ProviderPluginRegistry`, or provider modules.

The pipeline defines:

- Aggregation of raw provider result collections without transformation.
- Normalization from structural Greenhouse, Lever, and Ashby raw shapes into `CanonicalJob`.
- Validation with structured errors for missing title, provider identity, job identifier, invalid
  URL, or corrupt metadata.
- Exact deterministic deduplication using provider id, canonical URL, and company/title/location
  keys.
- Conservative quality filtering for missing company, missing location, or missing source metadata.
- Deterministic ranking by keyword relevance, posting recency, and provider priority.
- Unified response metadata including provider statistics, processing statistics, stage timings,
  validation summary, and deduplication decisions.

The pipeline remains local and stateless. It does not persist results, expose dashboard workflows,
use AI, perform semantic matching, cache results, or automate applications.

The Phase 3.6 review certified this processing boundary after hardening exact duplicate grouping as
connected components, validating provider metadata shape, and splitting provider-specific
normalizers into focused modules.

## Phase 3.7 Search Engine Certification

Phase 3.7 certifies the complete search engine as the foundation for Phase 4. `SearchService` now
offers `searchUnified(request)`, which executes selected providers through `SearchProviderRegistry`,
collects provider execution diagnostics, converts raw provider results into
`RawProviderResultCollection` records, and runs the Phase 3.6 processing pipeline to return a
`UnifiedSearchResponse`.

Provider plugins still live outside the domain package. `ProviderPluginRegistry` hands ready
providers to `SearchProviderRegistry` and now also exposes matching search configuration input so
provider priorities and plugin configuration remain synchronized during search execution.
`SearchService` enforces provider-specific timeout configuration when present and falls back to the
global search timeout otherwise.

Certified end-to-end dependency direction:

```text
provider plugins -> SearchProvider interface
ProviderPluginRegistry -> SearchProviderRegistry + SearchConfigurationInput
SearchService.searchUnified -> SearchResultProcessingPipeline -> UnifiedSearchResponse
```

Phase 3 remains free of dashboard UI, search persistence, search history, application queues,
tracking, AI ranking, semantic search, embeddings, and browser automation.

## Phase 4.1 Search Experience Foundation

Phase 4.1 adds the first user-facing search workflow in `apps/web`:

- Search tab in the existing development workspace.
- Resume selector that reuses the Phase 1 resume API and defaults to the primary resume when
  available.
- Search form for keywords, location, and remote preference.
- Next.js `/api/search` route that calls the certified `SearchService.searchUnified` boundary and
  returns `UnifiedSearchResponse`.
- Loading, validation error, retry, empty, and no-results states.

The UI consumes only the unified response summary. It does not render job cards, consume raw
provider models, persist search history, create search sessions, add sorting or pagination, or
perform browser automation. The foundation route currently runs the certified search pipeline
without configured live provider plugins; provider-backed result browsing belongs to later Phase 4
slices.

The Phase 4.1 review hardened the web boundary without changing Search Engine contracts. Malformed
search payloads are rejected at the Next.js route boundary, keyword inputs use native browser
validation, and error panels receive focus when client-side validation or execution fails.

## Phase 4.2 Job Browser

Phase 4.2 adds client-side browsing controls to the existing Search tab in `apps/web`:

- Job Browser rendering for canonical jobs from `UnifiedSearchResponse`.
- Compact job cards with title, company, provider badge, location, posted date, employment type, and
  remote/work-mode summary.
- Local browser utilities for provider, remote, employment type, and location filtering.
- Local sorting by relevance, newest, company, and title.
- Local pagination with a fixed page size for predictable state and simple tests.
- Individual selection, visible-job selection, and clear selection controls.

The Job Browser does not change `SearchService`, provider connectors, contracts, or the
`/api/search` route. Selection remains local UI state; it does not create job details, search
sessions, saved searches, application queues, application tracking, persistence, automation, or AI
behavior.

The Phase 4.2 review kept those boundaries unchanged and hardened only the browser layer. Sorting
now has stable ID tie-breakers for identical relevance, date, company, or title fields; invalid
local pagination state falls back to the default page size; and selection is explicitly reset when a
new unified response is rendered.

## Phase 4.3 Job Details & Evaluation

Phase 4.3 adds a read-only Job Details view inside the existing Search tab in `apps/web`:

- Details open from a Job Browser card and return to the browser without unmounting browser state.
- The view displays canonical job fields from `UnifiedSearchResponse`: title, company, locations,
  work mode, employment type, provider, posted/discovered dates, department, team, compensation,
  description, source board, provider job ID, source fields, and external source URL when available.
- Selection uses the same job ID set owned by `JobBrowser`, so selecting or deselecting in details
  stays synchronized with the browser.
- Missing optional fields render explicit fallback text, and invalid selected job IDs show a
  missing-job fallback with a browser return control.

The Job Details view does not change `SearchService`, provider connectors, contracts, or
`/api/search`. It does not fetch additional provider data, create search sessions, persist jobs,
create application queues, perform AI evaluation, or submit applications.

The Phase 4.3 review kept those boundaries unchanged and hardened only details rendering:
whitespace-only descriptions now use the explicit fallback, partial compensation values are shown
when available, and primitive source fields are trimmed, sorted, capped, and displayed
deterministically.

## Phase 4.4 Search Sessions

Phase 4.4 introduces lightweight in-memory Search Sessions in `apps/web`:

- Every successful search creates one active `SearchSession`.
- A session owns the submitted search request, search timestamp, status, unified search response,
  selected job IDs, and summary metadata.
- `SearchExperienceDashboard` owns session state and passes the active session into `JobBrowser`.
- `JobBrowser` and Job Details read results and selection from the active session.
- Browser filters, sorting, pagination, and details-panel navigation remain local UI state.

The session model is implemented in `apps/web/app/search-session.ts`. Selection updates replace the
small selected ID list while reusing the same unified response reference, avoiding unnecessary
copies of large result collections.

Phase 4.4 does not change `SearchService`, provider connectors, contracts, or `/api/search`. It does
not add persistence, search history UI, saved searches, application queues, tracking, automation,
analytics, sharing, deletion, or multi-user behavior.
