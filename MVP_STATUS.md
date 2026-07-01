# MVP Status

## Current Milestone

Phase 3.7 Search Engine release audit complete. Phase 4 Search Dashboard has not started.

## Implemented

- Resume Management: local metadata management, validation, APIs, and dashboard.
- User Knowledge Base: local CRUD, search, validation, APIs, and dashboard.
- Search Engine: provider plugin framework, Greenhouse, Lever, Ashby, processing pipeline, and
  certified unified search response.
- Developer Platform: monorepo tooling, linting, type checking, tests, builds, Docker configuration,
  CI configuration, and documentation hierarchy.

## Certified Search Boundary

Future product phases should consume `SearchService.searchUnified` and `UnifiedSearchResponse`.
Provider raw models are internal to provider connectors and processing.

## Not Yet Implemented

- Search Dashboard.
- Search persistence and search history.
- Approval workflow.
- Application automation.
- Application tracking.
- AI ranking, semantic search, embeddings, and answer suggestions.

## Next Required Approval

Phase 4 Search Dashboard requires explicit approval before implementation begins.
