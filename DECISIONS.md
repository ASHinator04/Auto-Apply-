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
