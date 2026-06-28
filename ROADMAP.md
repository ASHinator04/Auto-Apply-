# Roadmap

`PROJECT_PLAN.md` is the governing phase plan. This file is a quick navigation summary and must not
override the project plan.

## Phase 0A: Repository Constitution

Goal: create the engineering foundation.

Deliverables: repository structure, documentation hierarchy, AGENTS hierarchy, engineering guide,
architecture, PRD, roadmap, and ADR log.

Exit criteria: repository can be understood without reading implementation code.

Status: complete.

## Phase 0B.1: Technical Architecture and Infrastructure Design

Goal: select and document the technical architecture, infrastructure strategy, dependency graph,
risks, and Phase 0B.2 implementation plan.

Deliverables: technical design document, stack ADRs, updated engineering guide, architecture
updates, risk assessment, and state update.

Exit criteria: implementation can begin with minimal ambiguity after user approval; Phase 0B.1
changes are committed and pushed when a remote is configured.

Status: complete.

## Phase 0B.2: Engineering Infrastructure Implementation

Goal: create the development environment approved by Phase 0B.1.

Deliverables: monorepo configuration, frontend/backend shells allowed by `PROJECT_PLAN.md`, tooling,
Docker Compose, CI skeleton, and documentation updates.

Exit criteria: frontend launches, backend launches, Docker works, tests pass, lint passes,
documentation is updated, and changes are committed and pushed.

Status: complete; local install, frontend/backend startup, lint, typecheck, tests, and build are
verified. Docker build was later verified during Phase 0D.

## Phase 0C: Shared Contracts

Goal: define the shared language of the system.

Deliverables: domain models, shared interfaces, DTOs, enums, and errors without implementation
behavior.

Exit criteria: the system can be discussed using shared contracts.

Status: complete.

## Phase 0D: Developer Experience

Goal: optimize future development.

Deliverables: developer scripts, debug configuration, VS Code configuration, EditorConfig, Makefile,
repository tooling, documentation automation, and onboarding documentation.

Exit criteria: a new developer can clone, install, run, test, debug, lint, and contribute with
documented commands.

Status: complete.

## Phase 0 Verification Audit

Goal: verify that Phase 0 is ready for long-term feature development.

Deliverables: repository audit, documentation synchronization, structure review, tooling
verification, Docker verification, and readiness assessment.

Status: complete; see `docs/PHASE_0_AUDIT_REPORT.md`.

## Product Phases

- Phase 1: Resume Management. Status: complete.
- Phase 2: User Knowledge Base. Status: next, pending approval.
- Phase 3: Job Search Engine.
- Phase 4: Search Dashboard.
- Phase 5: Approval Pipeline.
- Phase 6: Application Engine.
- Phase 7: Application Tracking.
- Phase 8: Adaptive Learning.
- Phase 9: Hardening.
- Phase 10: MVP Release.
