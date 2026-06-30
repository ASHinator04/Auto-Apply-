# Search Spec

## Status

Phase 3.3 complete. This spec currently covers the provider-independent search engine foundation,
provider plugin framework, and Greenhouse raw search connector.

## Scope

Implemented scope:

- Search configuration for enabled providers, disabled providers, future priorities, timeout, and
  maximum provider count.
- Provider registry for registering and selecting providers without implementation knowledge.
- Explicit lifecycle pipeline for request acceptance, provider selection, provider execution, result
  collection, and response creation.
- Search service orchestration over the explicit pipeline.
- Empty-result behavior when no providers are registered.
- Provider plugin metadata, capability validation, discovery, lifecycle, configuration, enablement,
  disablement, and handoff to the search provider registry.
- Greenhouse raw search connector through the provider plugin framework.

Out of scope until later Phase 3 sub-phases:

- Additional concrete providers.
- HTTP scraping.
- Browser automation.
- HTML parsing.
- Job normalization.
- Deduplication.
- Ranking.
- Caching.
- Storage.
