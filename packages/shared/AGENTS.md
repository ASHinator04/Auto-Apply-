# packages/shared AGENTS

## Purpose

`packages/shared/` contains small utilities and shared constants that do not belong to a single
domain module.

## Responsibilities

Own cross-cutting helpers, common types, and constants only when reuse is real. As of Phase 0
completion it exposes infrastructure placeholder metadata and health payload typing.

## Constraints

Avoid turning this into a catch-all. Prefer placing behavior in a specific domain package when
ownership is clear.
