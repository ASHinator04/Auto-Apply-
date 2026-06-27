# Roadmap

`PROJECT_PLAN.md` is the governing phase plan. This file is a quick navigation summary and must not override the project plan.

## Phase 0A: Repository Constitution

Goal: create the engineering foundation.

Deliverables: repository structure, documentation hierarchy, AGENTS hierarchy, engineering guide, architecture, PRD, roadmap, and ADR log.

Exit criteria: repository can be understood without reading implementation code.

Status: complete.

## Phase 0B.1: Technical Architecture and Infrastructure Design

Goal: select and document the technical architecture, infrastructure strategy, dependency graph, risks, and Phase 0B.2 implementation plan.

Deliverables: technical design document, stack ADRs, updated engineering guide, architecture updates, risk assessment, and state update.

Exit criteria: implementation can begin with minimal ambiguity after user approval; Phase 0B.1 changes are committed and pushed when a remote is configured.

Status: current.

## Phase 0B.2: Engineering Infrastructure Implementation

Goal: create the development environment approved by Phase 0B.1.

Deliverables: monorepo configuration, frontend/backend shells allowed by `PROJECT_PLAN.md`, tooling, Docker Compose, CI skeleton, and documentation updates.

Exit criteria: frontend launches, backend launches, Docker works, tests pass, lint passes, documentation is updated, and changes are committed and pushed.

## Phase 0C: Shared Contracts

Goal: define the shared language of the system.

Deliverables: domain models, shared interfaces, DTOs, enums, and errors without implementation behavior.

Exit criteria: the system can be discussed using shared contracts.

## Product Phases

- Phase 1: Resume Management.
- Phase 2: User Knowledge Base.
- Phase 3: Job Search Engine.
- Phase 4: Search Dashboard.
- Phase 5: Approval Pipeline.
- Phase 6: Application Engine.
- Phase 7: Application Tracking.
- Phase 8: Adaptive Learning.
- Phase 9: Hardening.
- Phase 10: MVP Release.
