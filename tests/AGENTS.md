# tests AGENTS

## Purpose

`tests/` will contain cross-cutting tests that do not naturally live beside a single module.

## Responsibilities

Use this directory for integration tests, contract tests, fixture data, and end-to-end tests when a framework is selected.

## Constraints

Do not add a testing framework before Phase 0B stack decisions are documented. Keep tests deterministic and avoid live external platforms unless explicitly marked and isolated.

## Extension Guidelines

Organize tests by test type or workflow, for example `contract/`, `integration/`, and `e2e/`.
