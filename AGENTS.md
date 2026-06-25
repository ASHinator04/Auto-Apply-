# Repository Guidelines

## Project Overview

Job Agent is an AI-powered job application engine. The future product will ingest resumes, discover software engineering jobs, normalize listings, support bulk approval, automate applications, reuse application answers, and track application status.

This repository is currently in Phase 0A: repository constitution and engineering foundation. Do not implement product functionality in this phase.

## Engineering Philosophy

Optimize for maintainability, simplicity, readability, modularity, testability, low operational cost, AI-assisted development, and incremental delivery. Prefer documented decisions over implicit conventions. Build small, verifiable modules with clear boundaries.

## Repository Map

- `README.md`: product mission.
- `AGENTS.md`: root contributor and AI-agent guide.
- `ENGINEERING_GUIDE.md`: engineering standards and workflow.
- `ARCHITECTURE.md`: planned system architecture and boundaries.
- `PRD.md`: product requirements and non-goals.
- `ROADMAP.md`: phased delivery plan.
- `STATE.md`: current repository and phase status.
- `DECISIONS.md`: architecture decision record log.
- `TODO.md`: prioritized engineering backlog.
- `docs/`: supporting documentation.
- `specs/`: future feature and workflow specifications.
- `contracts/`: shared API, domain, event, and adapter contracts.
- `experiments/`: isolated research and prototypes.
- `playbooks/`: repeatable engineering operating procedures.
- `apps/`: future user-facing applications.
- `packages/`: future shared libraries and domain modules.
- `services/`: future background or integration services.
- `tests/`: future cross-cutting test suites.
- `scripts/`: future repository automation.
- `config/`: future shared configuration templates.

## Coding Standards

No runtime stack is selected yet. Do not add one without documenting the decision in `DECISIONS.md` and updating `ENGINEERING_GUIDE.md`. Future code should use descriptive domain names, small modules, explicit dependencies, and tests close to the behavior they protect.

## Architectural Principles

Use modular architecture, adapter-based external integrations, local-first storage where practical, and low-cost open-source tooling by default. Keep product policy, domain logic, platform integrations, automation, persistence, and UI concerns separated.

## AI Agent Rules

Before changing files, read this file plus the nearest child `AGENTS.md`. Follow the lifecycle: understand requirements, review context, design, plan, implement incrementally, test, verify, update docs, commit the completed phase with a clear message, push to the configured remote, summarize, then stop. Never create product functionality during Phase 0A.

## Documentation Map

Use `PRD.md` for product intent, `ARCHITECTURE.md` for system shape, `ENGINEERING_GUIDE.md` for engineering practice, `ROADMAP.md` for sequencing, `DECISIONS.md` for durable decisions, and `TODO.md` for actionable backlog. Avoid duplicating content; link or reference the owning document.

## Child AGENTS Hierarchy

Each major directory has its own `AGENTS.md`. Child guides assume this root file has already been read and should describe only local purpose, responsibilities, constraints, and extension rules.
