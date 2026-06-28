# contracts/domain AGENTS

## Purpose

`contracts/domain/` contains the canonical Phase 0C TypeScript contract package,
`@job-agent/contracts`.

## Responsibilities

Define durable concepts such as `Job`, `Resume`, `KnowledgeEntry`, `Application`, and `Provider`,
plus DTOs, enums, errors, and framework-independent interfaces.

## Constraints

Do not bind domain contracts to UI, storage, automation, FastAPI, Next.js, React, Playwright,
SQLite, SQLAlchemy, browser APIs, or vendor-specific data shapes.
