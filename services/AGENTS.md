# services AGENTS

## Purpose

`services/` will contain future background processes, workers, schedulers, and integration runners.

## Responsibilities

Services should orchestrate workflows such as job discovery, synchronization, application execution,
and status updates.

## Constraints

Services should coordinate domain packages and adapters rather than owning core business rules.
Long-running work must be observable, recoverable, and testable.

## Extension Guidelines

Add a local `AGENTS.md` for each service describing triggers, inputs, outputs, dependencies, and
failure handling.
