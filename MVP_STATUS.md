# MVP Status

## Current Milestone

Phase 4.3 Job Details & Evaluation complete. Phase 4.4 Search Sessions has not started.

## Implemented

- Resume Management: local metadata management, validation, APIs, and dashboard.
- User Knowledge Base: local CRUD, search, validation, APIs, and dashboard.
- Search Engine: provider plugin framework, Greenhouse, Lever, Ashby, processing pipeline, and
  certified unified search response.
- Search Experience Foundation: resume selector, search form, loading/error/empty/no-results states,
  and web route integration with the unified search response.
- Job Browser: client-side job cards, provider badges, filtering, sorting, pagination, individual
  and visible-job selection, clear selection controls, deterministic sort tie-breaks, and
  response-change selection reset.
- Job Details: read-only canonical job inspection, full description display, provider metadata,
  external source URL, missing-field fallbacks, browser return navigation, and synchronized
  selection toggle.
- Developer Platform: monorepo tooling, linting, type checking, tests, builds, Docker configuration,
  CI configuration, and documentation hierarchy.

## Certified Search Boundary

Future product phases should consume `SearchService.searchUnified` and `UnifiedSearchResponse`.
Provider raw models are internal to provider connectors and processing.

## Not Yet Implemented

- Search persistence and search history.
- Search sessions.
- Approval workflow.
- Application automation.
- Application tracking.
- AI ranking, semantic search, embeddings, and answer suggestions.

## Next Required Approval

Phase 4.4 Search Sessions requires explicit approval before implementation begins.
