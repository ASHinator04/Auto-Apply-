# Search Spec

## Status

Phase 3.1 complete. This spec currently covers only the provider-independent search engine
foundation.

## Scope

Implemented scope:

- Search configuration for enabled providers, disabled providers, future priorities, timeout, and
  maximum provider count.
- Provider registry for registering and selecting providers without implementation knowledge.
- Search service and lifecycle pipeline for request acceptance, provider selection, provider
  execution, result collection, and response creation.
- Empty-result behavior when no providers are registered.

Out of scope until later Phase 3 sub-phases:

- Concrete providers.
- HTTP scraping.
- Browser automation.
- Job normalization.
- Deduplication.
- Ranking.
- Storage.
