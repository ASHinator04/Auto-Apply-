# apps/web AGENTS

## Purpose

`apps/web/` contains the Next.js frontend. It currently owns the Phase 1 resume management
dashboard, Phase 2 user knowledge base dashboard, Phase 4.1 search experience foundation, Phase 4.2
Job Browser with review hardening, Phase 4.3 Job Details with review hardening, and Phase 4.4 Search
Sessions. It will later expand into certification hardening, approvals, applications, and settings.

## Responsibilities

Own presentation, routing, UI state, and user interactions. Compose API clients and stable shared
interfaces without moving backend rules into the UI.

## Constraints

Do not place job discovery internals, browser automation, persistence, AI behavior, semantic
retrieval, or core business rules here. Search UI should consume only the certified unified search
response boundary and must not consume provider-specific raw models. The Job Browser may filter,
sort, paginate, and select canonical jobs in memory, but must not create applications or job-detail
routes. The Job Details view is read-only, reuses the current unified response, and must not fetch
provider data or create search sessions. Job Details fallbacks should display only available
canonical information and avoid inventing missing provider data. Search Sessions are in-memory UI
state in Phase 4.4; they own search request, response, and selected job IDs but must not introduce
persistence, saved searches, application queues, tracking, or automation.
