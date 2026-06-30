# Provider Plugin Framework

## Purpose

The provider plugin framework lets future job platforms plug into the search engine without making
`SearchService` know provider implementation details.

## Plugin Shape

A provider plugin must expose:

- `metadata`: id, provider type, display name, version, and capabilities.
- `provider`: the future search provider contract used after the plugin is ready.
- Optional `initialize` and `shutdown` lifecycle hooks.

Metadata is discoverable without executing provider search.

## Capabilities

Every plugin must declare capability flags for:

- Keyword search
- Pagination
- Location filters
- Remote search
- Salary data
- Future capability flags

Capabilities describe support only. They do not execute search, parsing, ranking, storage, or
network behavior.

## Lifecycle

The registry manages these statuses:

1. `validated`
2. `disabled`
3. `ready`
4. `shutdown`

Disabled plugins cannot initialize. Ready plugins can be handed to `SearchProviderRegistry`.

Lifecycle transition rules:

- Disabled plugins cannot initialize.
- Ready plugins initialize once.
- Ready plugins must be shutdown before they can be disabled.
- Only ready plugins can shutdown.
- Shutdown plugins cannot be re-enabled or re-initialized.

Registry list methods return snapshots. Use registry methods to change lifecycle state.

## Dependency Rule

```text
SearchService -> SearchProviderRegistry
ProviderPluginRegistry -> SearchProviderRegistry
future provider plugin -> ProviderPlugin interface
```

Provider plugins must not reference each other, and the domain package must not import concrete
provider modules.
