# MVP Status

## Current Milestone

Phase 4.1 Search Experience foundation and review complete. Phase 4.2 Search Results Dashboard has
not started.

## Implemented

- Resume Management: local metadata management, validation, APIs, and dashboard.
- User Knowledge Base: local CRUD, search, validation, APIs, and dashboard.
- Search Engine: provider plugin framework, Greenhouse, Lever, Ashby, processing pipeline, and
  certified unified search response.
- Search Experience Foundation: resume selector, search form, loading/error/empty/no-results states,
  and web route integration with the unified search response.
- Developer Platform: monorepo tooling, linting, type checking, tests, builds, Docker configuration,
  CI configuration, and documentation hierarchy.

## Certified Search Boundary

Future product phases should consume `SearchService.searchUnified` and `UnifiedSearchResponse`.
Provider raw models are internal to provider connectors and processing.

## Not Yet Implemented

- Search Results Dashboard.
- Search persistence and search history.
- Approval workflow.
- Application automation.
- Application tracking.
- AI ranking, semantic search, embeddings, and answer suggestions.

## Next Required Approval

Phase 4.2 Search Results Dashboard requires explicit approval before implementation begins.
