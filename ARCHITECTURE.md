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
