# Architecture Decision Records

Future architectural decisions should be appended to this log. Do not rewrite historical decisions
except to correct factual errors.

## ADR-0001: AI-First Development Workflow

Status: Accepted

Decision: The repository will be optimized for AI-assisted development through clear documentation,
hierarchical `AGENTS.md` files, and explicit phase workflows.

Rationale: Future agents need reliable context and local instructions to make bounded, consistent
changes.

## ADR-0002: Modular Architecture

Status: Accepted

Decision: Product behavior will be organized into modules with clear ownership boundaries.

Rationale: The product will grow across UI, domain logic, integrations, automation, and persistence.
Modular boundaries reduce coupling.

## ADR-0003: Adapter-Based Integrations

Status: Accepted

Decision: External job platforms, browser automation, storage engines, and vendor APIs will be
isolated behind adapters.

Rationale: Integrations are likely to change. Adapters preserve the core workflow.

## ADR-0004: Local-First Where Practical

Status: Accepted

Decision: Prefer local-first development and storage where it is practical and secure.

Rationale: Local-first choices reduce cost, improve developer feedback, and simplify early
validation.

## ADR-0005: Low-Cost Open-Source First

Status: Accepted

Decision: Prefer low-cost and open-source tools unless a paid dependency is justified by clear
product value.

Rationale: The MVP should minimize operational cost and avoid unnecessary platform lock-in.

## ADR-0006: Hierarchical AGENTS Documentation

Status: Accepted

Decision: The root and every major directory will use `AGENTS.md` files for local contributor and
AI-agent guidance.

Rationale: Hierarchical guidance minimizes context size while keeping directory-specific rules
discoverable.

## ADR-0007: Incremental Phased Development

Status: Accepted

Decision: Development will proceed in explicit phases with deliverables, exit criteria, and stop
points.

Rationale: Phased delivery reduces risk and prevents premature implementation.

## ADR-0008: Git Commit and Push Required Per Phase

Status: Accepted

Decision: Every phase must end with scoped Git commits and a push to the configured remote.

Rationale: Phase history should be durable, reviewable, and recoverable before subsequent work
begins.

## ADR-0009: Phase 0B.1 Recommended Engineering Stack

Status: Accepted for Phase 0B.1 design

Decision: Use Next.js with TypeScript, Tailwind CSS, shadcn/ui, FastAPI, uv, Ruff, Pyright, SQLite,
Playwright, Vitest, pytest, ESLint, Prettier, pnpm workspaces, Docker Compose, Markdown
documentation, and GitHub Actions.

Rationale: This stack matches the approved project plan, keeps local development low-cost, uses
common tools, and remains understandable for junior engineers.

## ADR-0010: SQLite as Initial Database

Status: Accepted for Phase 0B.1 design

Decision: Use SQLite as the initial MVP database, accessed through a persistence boundary.

Rationale: SQLite is free, local-first, simple to operate, and adequate for early single-user MVP
workflows. A persistence boundary preserves a future migration path to Postgres.

## ADR-0011: pnpm and uv for Package Management

Status: Accepted for Phase 0B.1 design

Decision: Use pnpm for JavaScript and TypeScript workspace management, and uv for Python service
dependency management.

Rationale: pnpm provides fast monorepo installs and deterministic lockfiles. uv provides fast,
modern Python dependency management without heavy project setup.

## ADR-0012: Contracts as Cross-Layer Dependency Boundary

Status: Accepted for Phase 0B.1 design

Decision: Applications, services, packages, providers, automation, and persistence must communicate
through documented contracts where cross-layer shapes are shared.

Rationale: Stable contracts prevent frontend, backend, search, automation, and persistence modules
from depending directly on each other.

## ADR-0013: TypeScript Contract Package as Phase 0C Canonical Surface

Status: Accepted

Decision: Define Phase 0C shared contracts in `contracts/domain` as the `@job-agent/contracts`
TypeScript package.

Rationale: The frontend and shared workspace are TypeScript-based, TypeScript interfaces compile
without runtime framework dependencies, and the package can later be mirrored into Python or schema
formats if backend runtime validation requires it. Contracts remain framework-independent and do not
depend on implementation modules.

## ADR-0014: Metadata-Only Resume Storage for Phase 1

Status: Accepted

Decision: Phase 1 validates uploaded PDF files but persists only resume metadata in a local SQLite
database. Resume file bytes are not stored.

Rationale: The Phase 1 requirement is resume management metadata without parsing, AI, OCR, or cloud
storage. SQLite keeps the workflow local and durable while preserving a clear repository boundary
for future storage changes.

## ADR-0015: Local Structured Knowledge Storage for Phase 2

Status: Accepted

Decision: Store Phase 2 knowledge base entries as structured local SQLite records behind a
repository and service boundary. Entries include section, answer type, title, content, optional
company name, sort order, and timestamps. Search is keyword-only over stored text fields.

Rationale: Phase 2 requires accurate, editable, persistent user information without AI, embeddings,
semantic retrieval, or cloud sync. SQLite keeps the MVP local-first and inexpensive while preserving
a future migration path through the repository boundary.

## ADR-0016: Provider-Independent Search Orchestration for Phase 3.1

Status: Accepted

Decision: Implement the Phase 3.1 search engine foundation in `packages/domain` as the
`@job-agent/domain` TypeScript package. The package owns search configuration, provider registry,
provider-independent lifecycle orchestration, and a search service that depends on
`@job-agent/contracts`.

Rationale: Phase 3.1 must define how searches flow without implementing Greenhouse, Lever, Ashby,
HTTP scraping, browser automation, storage, normalization, deduplication, or ranking. Keeping the
foundation in the domain package preserves dependency direction and allows later provider phases to
plug in through registry interfaces.

## ADR-0017: Explicit Search Pipeline Stages for Phase 3.1 Review

Status: Accepted

Decision: Represent Phase 3.1 search flow as explicit pipeline stage definitions and lifecycle
recording in `packages/domain/src/search/pipeline.ts`, while keeping execution orchestration in
`SearchService`.

Rationale: The architecture review found the original pipeline was correct but too implicit inside
the service. Explicit stages make extension points visible for later provider adapter,
normalization, ranking, caching, and storage work without implementing those future capabilities
early.

## ADR-0018: Provider Plugins as the Phase 3.2 Extension Mechanism

Status: Accepted

Decision: Provider extensions will enter the search engine through a provider plugin framework in
`@job-agent/domain`. Plugins expose metadata, capabilities, configuration, lifecycle hooks, and a
future-ready provider contract. `ProviderPluginRegistry` validates plugins, controls enablement, and
hands ready providers to `SearchProviderRegistry`.

Rationale: The search engine must not know provider implementation details. A plugin framework keeps
future Greenhouse, Lever, Ashby, and other providers independent while preserving a simple
dependency direction: search engine to registry to plugin interface to provider plugin.

## ADR-0019: Strict Provider Plugin Lifecycle Transitions

Status: Accepted

Decision: The provider plugin registry validates lifecycle transitions and returns descriptor
snapshots rather than live registry state. Disabled plugins cannot initialize, ready plugins are
initialized once, ready plugins must be shutdown before disabling, only ready plugins can shutdown,
and shutdown plugins cannot re-enter active states.

Rationale: Phase 3.2 review confirmed the plugin framework was provider-agnostic, but lifecycle
transitions needed stronger guardrails for future providers. Strict transitions make plugin behavior
predictable without adding concrete provider functionality.

## ADR-0020: Greenhouse as First Provider Plugin

Status: Accepted

Decision: Implement Greenhouse as the first concrete provider in `@job-agent/providers`, outside the
domain search engine and plugin framework. The connector returns raw Greenhouse job objects and uses
the provider plugin framework for registration and readiness.

Rationale: Greenhouse is a public job board provider with a documented JSON endpoint. Implementing
it as a provider package validates the plugin architecture while preserving the Phase 3.6 boundary
for normalization, deduplication, ranking, caching, and storage.

## ADR-0021: Provider Connector Response Hardening

Status: Accepted

Decision: Provider HTTP clients should classify invalid JSON as a non-retryable provider response
error, classify abort-style failures as timeouts, and follow pagination links only when they stay on
the configured provider API origin. Provider parsers should snapshot raw top-level payloads before
returning them through the raw provider contract.

Rationale: Phase 3.3 review found the Greenhouse connector architecture correct but identified
response handling edge cases that should be explicit before adding more providers. These rules keep
provider connectors deterministic without adding normalization, storage, ranking, or cross-provider
aggregation early.

## ADR-0022: Lever as Second Provider Plugin

Status: Accepted

Decision: Implement Lever as the second concrete provider in `@job-agent/providers`, mirroring the
Greenhouse connector structure. The connector returns raw Lever posting objects and uses the
provider plugin framework for registration and readiness without changing the search engine,
registry, plugin framework, or shared contracts.

Rationale: Lever exposes a public postings API with JSON output, skip/limit pagination, and
provider-side category filters for location, team, department, and commitment. Implementing Lever as
an independent provider validates the plugin framework against a second API shape while preserving
the Phase 3.6 boundary for aggregation, normalization, deduplication, ranking, caching, and storage.

## ADR-0023: Shared Provider JSON Request Utility

Status: Accepted

Decision: Greenhouse and Lever share provider-agnostic JSON HTTP request infrastructure in
`packages/providers/src/shared/http-json-client.ts`. The helper owns timeout setup, transient retry,
`Retry-After` handling, JSON parsing, common HTTP headers, rate-limit mapping, invalid JSON
classification, and abort-style timeout classification. Provider modules still own request building,
pagination interpretation, parsing, filtering, raw models, configuration, and plugin registration.

Rationale: Phase 3.4 review found duplicated networking code across both provider connectors. A
small shared utility reduces drift before Ashby while preserving provider-specific behavior and
avoiding premature abstraction of parsing, pagination, or search semantics.

## ADR-0024: Ashby as Third Provider Plugin

Status: Accepted

Decision: Implement Ashby as the third concrete provider in `@job-agent/providers`, using the same
provider folder structure as Greenhouse and Lever. The connector uses Ashby's public job postings
API, returns raw Ashby posting objects, and uses the provider plugin framework for registration and
readiness without changing the search engine, registry, plugin framework, or shared contracts.

Rationale: Ashby's public postings API exposes published job postings for a configured job board
name through a JSON endpoint. Implementing Ashby validates the provider standard against a third API
shape while preserving the Phase 3.6 boundary for aggregation, normalization, deduplication,
ranking, caching, and storage.
