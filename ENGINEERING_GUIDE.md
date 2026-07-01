# Engineering Guide

## Purpose

This guide defines how software is built in the Job Agent repository. Phase 0 established the
developer workflow, repository boundaries, and verification commands without adding product
functionality.

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

Use Vitest for TypeScript tests and pytest for Python tests. Use `*.test.ts` for TypeScript and
`test_*.py` for Python. Tests should cover domain rules, adapter contracts, configuration
validation, and high-risk workflows.

## Coding Limits

Prefer files under 300 lines and functions under 50 lines. Larger units require a clear reason and
should usually be split by responsibility. Avoid generic utility modules unless at least two real
call sites need the shared behavior.

## Imports and Interfaces

Prefer explicit imports. Do not import across ownership boundaries when a contract should exist
instead. Interfaces should describe stable boundaries, not implementation details.

Shared domain contracts live in `@job-agent/contracts`. Application, service, provider, automation,
persistence, and UI modules should import shared shapes from that package rather than redefining
cross-layer types.

Search orchestration lives in `@job-agent/domain`. Its Phase 3.1 pipeline stages are explicit in
`packages/domain/src/search/pipeline.ts`; future phases should extend the search flow through
documented boundaries instead of hiding provider, ranking, storage, or UI behavior inside
`SearchService`. Phase 3.7 certifies `SearchService.searchUnified` as the provider-to-canonical
search boundary for future product surfaces.

Phase 4.1 web search surfaces must consume only the unified search response. Keep search form state,
request state, response state, and UI state separate in the frontend. Do not render provider raw
models or add Job Browser behavior before the approved phase.

Web routes that adapt UI payloads into search requests should validate malformed JSON, filter
arrays, and enum values before calling `SearchService.searchUnified`. Keep this validation at the
web boundary rather than modifying Search Engine contracts for UI concerns.

Provider plugin infrastructure also lives in `@job-agent/domain`. Future providers should implement
the `ProviderPlugin` interface, expose metadata without executing, pass registry validation, and
hand ready providers into `SearchProviderRegistry`. Provider plugins must not depend on each other.
Registry list methods return snapshots; provider plugin lifecycle state must be changed through the
registry API only. Use `ProviderPluginRegistry.createSearchProviderRegistry()` together with
`ProviderPluginRegistry.createSearchConfigurationInput()` when wiring ready plugins into
`SearchService`. Provider-specific timeouts from plugin configuration are enforced by the search
service.

Concrete provider connectors live in `@job-agent/providers`. Provider packages may own HTTP clients,
request builders, response parsers, raw provider models, and provider-specific configuration. They
must not change search orchestration or normalize jobs unless the active phase explicitly allows it.
Common provider-only JSON HTTP behavior lives in `packages/providers/src/shared`; keep provider
request builders, pagination, parsing, filters, raw models, and registration local to each provider.

## Dependency Injection

Inject infrastructure dependencies at service boundaries. Domain code should receive inputs and
contracts, not construct clients for databases, providers, LLMs, or browsers.

## Expected Development Commands

Use these commands for local development:

```powershell
pnpm bootstrap
pnpm dev
pnpm verify
pnpm clean
```

Use these lower-level commands when investigating a specific failure:

```powershell
pnpm test
pnpm lint
pnpm format
pnpm typecheck
pnpm build
docker compose up --build
```

Use `pnpm dev:web` or `pnpm dev:api` to run one surface at a time.

`pnpm verify` is the required repository health check before committing. It runs format checks,
linting, type checking, tests, and build.

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
