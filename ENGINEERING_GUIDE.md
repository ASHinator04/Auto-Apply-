# Engineering Guide

## Purpose

This guide defines how software is built in the Job Agent repository. Phase 0B.2 implements the
approved engineering infrastructure without product functionality.

## Development Workflow

Every phase must follow this lifecycle:

1. Understand requirements.
2. Review relevant `AGENTS.md` files.
3. Produce a technical design.
4. Produce an implementation plan.
5. Implement incrementally.
6. Write tests.
7. Verify functionality.
8. Update documentation.
9. Commit the completed phase with a clear, scoped message.
10. Push the commit to the configured remote.
11. Produce a phase summary.
12. Stop and wait for the next phase.

## Branching Strategy

Use Git for every phase. Each phase should end with at least one clear commit and a push to the
configured remote before the phase is considered complete. Prefer short-lived feature branches and
pull requests with clear scope, verification steps, and linked roadmap items once remote
collaboration is configured.

## Naming Conventions

Use descriptive, domain-oriented names. Prefer kebab-case for directories such as `job-search` and
`application-tracking`. Use singular names for core concepts where practical, for example `resume`,
`job`, `application`, and `answer`.

TypeScript files should use descriptive names such as `job-card.tsx`, `provider-contract.ts`, or
`application-status.ts`. Python modules should use snake_case such as `config_loader.py` or
`health_check.py`. Types, classes, and interfaces should use PascalCase. Functions and variables
should use camelCase in TypeScript and snake_case in Python.

## Folder Conventions

Top-level directories represent ownership boundaries. Place shared domain logic in `packages/`,
applications in `apps/`, background or integration processes in `services/`, contracts in
`contracts/`, experiments in `experiments/`, and cross-cutting tests in `tests/`. Each major
directory must include an `AGENTS.md` before substantive files are added.

## Dependency Rules

Choose low-cost, open-source, actively maintained dependencies. Avoid adding dependencies before
documenting why they are needed. Keep external platform integrations behind adapters so providers
can be replaced.

Allowed dependency direction is documented in `docs/PHASE_0B_1_TECHNICAL_DESIGN.md`. Circular
dependencies are forbidden. Contracts must not depend on implementation modules.

## Layering Rules

Domain logic must not depend on UI, browser automation, storage engines, or vendor APIs directly.
Platform-specific code should call into stable domain interfaces rather than owning business rules.

## Error Handling and Logging

Future code should make failure states explicit, preserve enough context for debugging, and avoid
leaking secrets. Logging should support auditability for job discovery, approval, application
submission, and status tracking.

## Configuration Management

Never commit secrets. Use documented environment variables and local templates. Prefer configuration
that can run locally at low cost.

Use `.env.example` for documented variables. Use `.env.local` or `.env` for local secrets and keep
them untracked. Backend configuration should be validated on startup with Pydantic Settings once the
backend exists.

## Testing Strategy

Use Vitest for TypeScript tests and pytest for Python tests once Phase 0B.2 configures tooling. Use
`*.test.ts` for TypeScript and `test_*.py` for Python. Tests should cover domain rules, adapter
contracts, configuration validation, and high-risk workflows.

## Coding Limits

Prefer files under 300 lines and functions under 50 lines. Larger units require a clear reason and
should usually be split by responsibility. Avoid generic utility modules unless at least two real
call sites need the shared behavior.

## Imports and Interfaces

Prefer explicit imports. Do not import across ownership boundaries when a contract should exist
instead. Interfaces should describe stable boundaries, not implementation details.

## Dependency Injection

Inject infrastructure dependencies at service boundaries. Domain code should receive inputs and
contracts, not construct clients for databases, providers, LLMs, or browsers.

## Expected Development Commands

Use these commands for local development:

```powershell
pnpm install
uv sync
pnpm dev
pnpm test
pnpm lint
pnpm format
pnpm typecheck
pnpm build
docker compose up --build
```

Use `pnpm dev:web` or `pnpm dev:api` to run one surface at a time.

## Documentation Expectations

Documentation is part of implementation. Update `ARCHITECTURE.md`, `DECISIONS.md`, `ROADMAP.md`, and
local `AGENTS.md` files when boundaries or behavior change.

## Code Review Checklist

Confirm scope, tests, documentation updates, dependency justification, error handling, security
considerations, and alignment with the nearest `AGENTS.md`.

## Commit Guidelines

Use concise imperative commit messages, such as `Establish Phase 0A repository foundation`. Keep
commits scoped to the phase or task. Do not mix unrelated changes into a phase commit.

## Refactoring Guidelines

Refactor when it reduces real complexity or clarifies boundaries. Avoid broad rewrites without a
phase goal and verification plan.
