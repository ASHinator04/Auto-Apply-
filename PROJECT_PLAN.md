# Project Plan

> **Status:** Approved v1.0
>
> This document defines the official engineering phases for the Job Agent project.
>
> Once approved, these phases become the source of truth for all contributors (human and AI).
>
> No AI agent may skip phases, merge phases, introduce new phases, or substantially change a phase
> without explicit user approval.
>
> Suggested improvements are welcome but must remain proposals until approved.

---

# Project Governance

## Engineering Rules

1. Every task belongs to exactly one approved phase.
2. Work must be completed in order.
3. Future phases must not be implemented early.
4. Every phase must end in a working and reviewable state.
5. Documentation is considered part of implementation.
6. Architecture changes require approval and must be recorded in `DECISIONS.md`.
7. Feature creep is prohibited.
8. Ideas outside the current phase should be recorded in `TODO.md` rather than implemented.

---

# Phase Workflow

Every phase must follow exactly this workflow.

```
Requirements Review
        ↓
Technical Design
        ↓
Implementation Plan
        ↓
Implementation
        ↓
Testing
        ↓
Documentation Update
        ↓
Phase Report
        ↓
User Approval
        ↓
Next Phase
```

No AI may skip steps.

---

# Phase 0A — Repository Constitution

## Goal

Create the engineering foundation.

### Deliverables

- Repository structure
- Documentation hierarchy
- AGENTS hierarchy
- Engineering Guide
- Architecture
- PRD
- Roadmap
- ADR log

### Exit Criteria

Repository can be understood without reading implementation code.

**Status:** ✅ Complete

---

# Phase 0B — Engineering Infrastructure

## Goal

Create the engineering environment required for development.

## Scope

### Repository

- Monorepo configuration
- Workspace management

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

(No product pages.)

### Backend

- FastAPI
- uv
- Ruff
- Pyright
- Configuration
- Logging
- Health endpoint

(No business logic.)

### Shared

- Shared package
- Common interfaces
- Constants
- Utilities

### Tooling

- Docker
- Docker Compose
- Git hooks
- Formatting
- Linting
- Testing
- CI skeleton

### Documentation

Update all affected documentation.

### Out of Scope

- Resume handling
- Job search
- Database models
- Playwright
- AI functionality
- Business logic

### Exit Criteria

- Frontend launches
- Backend launches
- Docker works
- Tests pass
- Lint passes
- Documentation updated

---

# Phase 0C — Shared Contracts

## Goal

Define the shared language of the system.

### Deliverables

Domain models only.

Examples:

- Job
- Resume
- User
- KnowledgeEntry
- Application
- Provider

Shared interfaces.

Shared DTOs.

Enums.

Errors.

No implementation.

### Exit Criteria

Entire system can be discussed using shared contracts.

---

# Phase 0D — Developer Experience

## Goal

Optimize future development.

### Deliverables

- Developer scripts
- Debug configuration
- VS Code configuration
- EditorConfig
- Makefile
- Repository tooling
- Documentation automation

### Exit Criteria

A new developer can clone and run the project within five minutes.

---

# Phase 1 — Resume Management

## Goal

Manage resumes.

### Deliverables

- Upload
- Storage
- List
- Delete
- Metadata
- Validation

### Out of Scope

- Parsing
- AI
- Resume optimization

### Exit Criteria

Users can manage multiple resumes.

---

# Phase 2 — User Knowledge Base

## Goal

Store reusable user information.

### Deliverables

Editable sections including:

- Personal
- Contact
- Education
- Experience
- Salary
- Notice Period
- Links
- Behavioral Answers
- Company Specific Answers

CRUD only.

No AI.

### Exit Criteria

Knowledge Base is fully editable.

---

# Phase 3 — Job Search Engine

## Goal

Discover jobs.

### Deliverables

- Greenhouse adapter
- Lever adapter
- Ashby adapter
- Job normalization
- Deduplication
- Local storage

### Exit Criteria

Normalized jobs are successfully retrieved.

---

# Phase 4 — Search Dashboard

## Goal

Display discovered jobs.

### Deliverables

- Filtering
- Sorting
- Pagination
- Bulk selection
- Match score

### Exit Criteria

Users can browse and review jobs.

---

# Phase 5 — Approval Pipeline

## Goal

Approve jobs before application.

### Deliverables

- Approve
- Reject
- Bulk approval
- Application queue

### Exit Criteria

Approved jobs are queued.

---

# Phase 6 — Application Engine

## Goal

Automatically apply to approved jobs.

### Deliverables

- Playwright automation
- Resume upload
- Form filling
- Question answering
- Submission
- Retry logic
- Logging

### Exit Criteria

Applications complete successfully on supported providers.

---

# Phase 7 — Application Tracking

## Goal

Track applications.

### Deliverables

- Timeline
- Status
- History
- Applied date
- Failures
- Success

### Exit Criteria

Every application has a complete lifecycle.

---

# Phase 8 — Adaptive Learning

## Goal

Continuously improve the Knowledge Base.

### Deliverables

- Detect unseen questions
- Suggest reusable answers
- Semantic retrieval
- User approval before saving

### Exit Criteria

Knowledge Base grows through user-approved learning.

---

# Phase 9 — Hardening

## Goal

Production readiness.

### Deliverables

- Performance optimization
- Error handling
- Accessibility
- Security
- Test coverage
- Reliability improvements

### Exit Criteria

Release Candidate ready.

---

# Phase 10 — MVP Release

## Goal

Ship Version 1.

### Deliverables

- Deployment
- Documentation
- Release notes
- Known limitations
- Final validation

### Exit Criteria

Public MVP release.

---

# Review Process

Every completed phase must include:

- Requirements Review
- Architecture Review
- Implementation Review
- Testing Review
- Documentation Review
- Phase Report

Only after explicit user approval may work begin on the next phase.

---

# AI Rules

All AI assistants working on this repository must:

- Read `AGENTS.md`
- Read this document
- Read the local `AGENTS.md`
- Understand the current phase
- Work only within the approved phase
- Keep documentation synchronized
- Stop after completing the current phase

No AI may continue into the next phase automatically.

This document is the governing contract for project execution.
