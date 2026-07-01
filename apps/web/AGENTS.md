# apps/web AGENTS

## Purpose

`apps/web/` contains the Next.js frontend. It currently owns the Phase 1 resume management
dashboard, Phase 2 user knowledge base dashboard, and Phase 4.1 search experience foundation. It
will later expand into search results, jobs, approvals, applications, and settings.

## Responsibilities

Own presentation, routing, UI state, and user interactions. Compose API clients and stable shared
interfaces without moving backend rules into the UI.

## Constraints

Do not place job discovery internals, browser automation, persistence, AI behavior, semantic
retrieval, or core business rules here. Search UI should consume only the certified unified search
response boundary and must not consume provider-specific raw models.
