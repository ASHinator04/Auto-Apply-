# Search Spec

## Status

Phase 3.6 complete. This spec covers the provider-independent search engine foundation, provider
plugin framework, concrete raw providers, and stateless search result processing pipeline.

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
- Greenhouse, Lever, and Ashby raw search connectors through the provider plugin framework.
- Stateless processing pipeline for aggregation, normalization, validation, deduplication, quality
  filtering, deterministic ranking, and unified search response creation.

Out of scope until later Phase 3 sub-phases:

- HTTP scraping.
- Browser automation.
- HTML parsing.
- Caching.
- Storage.
- Dashboard integration.
- Search engine final certification.
