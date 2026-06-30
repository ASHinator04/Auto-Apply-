# Phase 3.2 Report: Provider Plugin Framework

## Executive Summary

Phase 3.2 adds the provider plugin framework for future job discovery providers. The search engine
can now discover, validate, configure, enable, disable, initialize, and hand off provider plugins
without knowing implementation details. No concrete provider, HTTP request, browser automation, HTML
parsing, normalization, deduplication, ranking, caching, dashboard, storage, or search UI was
implemented.

## Plugin Architecture

Provider plugins expose metadata, capability flags, optional lifecycle hooks, and a future-ready
search provider contract. Metadata can be inspected without executing provider search. Discovery is
handled by implementation-independent discoverers.

## Registry Design

`ProviderPluginRegistry` owns plugin registration, validation, resolution, enablement, disablement,
initialization, shutdown, and handoff to `SearchProviderRegistry`. `SearchService` remains
orchestration-only and does not know plugin implementation details.

## Interfaces Added

- `ProviderPlugin`
- `ProviderPluginMetadata`
- `ProviderPluginCapabilitySet`
- `ProviderPluginConfiguration`
- `ProviderPluginRegistration`
- `ProviderPluginDiscoverer`
- `ProviderPluginDescriptor`
- `ProviderPluginLifecycleStatus`

## Validation Rules

- Provider plugin ids must be present and unique.
- Provider names and versions are required.
- Plugin metadata id and provider id must match.
- Plugin metadata type and provider type must match.
- Required capability flags must be declared.
- Provider priority and timeout must be valid integers.
- Future retry policy configuration is validated but not executed.

## Tests Added

- Provider plugin registration.
- Duplicate detection.
- Metadata validation.
- Capability validation.
- Enable and disable lifecycle.
- Initialization readiness.
- Shutdown lifecycle.
- Plugin discovery.
- Registry handoff to `SearchProviderRegistry`.
- Provider plugin configuration validation.

## Documentation Updated

- `AGENTS.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `ENGINEERING_GUIDE.md`
- `ROADMAP.md`
- `STATE.md`
- `TODO.md`
- `docs/PROVIDER_PLUGIN_FRAMEWORK.md`
- `packages/domain/AGENTS.md`
- `specs/search/SPEC.md`

## Known Limitations

- No concrete providers are implemented.
- Plugin discovery is interface-based; no filesystem or package auto-loading exists yet.
- Retry policy is configuration-only and has no execution behavior.
- Ready plugins are handed to the existing search registry, but no provider search is executed by
  this phase.

## Readiness for Phase 3.3

Phase 3.3 can implement the Greenhouse provider as an independent provider plugin that declares
metadata, passes validation, initializes through the lifecycle, and registers with the existing
search provider registry. Do not begin Phase 3.3 without explicit approval.
