# Search Spec

## Status

Phase 3.7 complete. This spec covers the provider-independent search engine foundation, provider
plugin framework, concrete raw providers, stateless search result processing pipeline, and final
search engine certification.

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
- End-to-end unified search execution through `SearchService.searchUnified`, using ready provider
  plugins, raw provider result collection, and the certified processing pipeline.
- Provider plugin registry handoff of ready providers and matching search configuration input.

Out of scope:

- HTTP scraping.
- Browser automation.
- HTML parsing.
- Caching.
- Storage.
- Dashboard integration.
