# Provider Implementation Guide

## Purpose

This is the canonical engineering standard for job provider connectors. Greenhouse, Lever, and Ashby
are the reference implementations.

## Repository Layout

Each provider lives in `packages/providers/src/{provider}` and must include:

- `configuration.ts`: defaults, typed input, validation, enabled state, priority, timeout, retries,
  logging, and provider-specific options.
- `request-builder.ts`: provider-specific URL construction and supported provider-side filters.
- `http-client.ts`: JSON fetching through `packages/providers/src/shared`.
- `parser.ts`: provider-specific response parsing into raw models only.
- `models.ts`: raw provider request/result/job shapes.
- `filters.ts`: supported local filters over raw fields.
- `connector.ts`: request, fetch, parse, local filter, and raw result orchestration.
- `plugin.ts`: provider metadata, capability flags, provider bridge, and `searchRaw`.
- `registration.ts`: plugin registration and discoverer helpers.
- `errors.ts`, `logger.ts`, `index.ts`, and matching mocked `*.test.ts` files.

Provider folders must not import sibling provider folders. Cross-provider reuse belongs only in
`packages/providers/src/shared` and only when behavior is truly provider-agnostic.

## Naming

Use provider-prefixed names such as `AshbySearchConnector`, `RawAshbyJob`,
`createAshbyProviderPlugin`, and `buildAshbyJobsUrl`. Provider IDs use `{provider}:{board-or-site}`.

Use the same exported surface for each provider:

- `create{Provider}ConnectorConfiguration`
- `{Provider}SearchConnector`
- `{Provider}HttpClient`
- `parse{Provider}...Response`
- `filter{Provider}Jobs`
- `create{Provider}ProviderPlugin`
- `create{Provider}PluginRegistration`
- `create{Provider}PluginDiscoverer`

## Networking

Use `requestJsonWithRetry` for timeout, User-Agent, retry, rate-limit, transient failure, invalid
JSON, and abort-style timeout behavior. Keep pagination and URL semantics inside the provider.

Provider HTTP clients should expose `getJson(url)` and return the raw parsed JSON payload plus only
provider-specific transport metadata, such as a Greenhouse next-page URL. Tests must inject mocked
`fetch` and `sleep`; no automated test may call the real provider.

## Parsing and Models

Parse only fields exposed by the provider. Do not infer missing values, normalize jobs, deduplicate,
rank, cache, or store results. Include provider metadata and a shallow raw payload snapshot.

Raw models should use provider vocabulary, not application domain vocabulary. Required fields should
only be required when the parser can always provide them, such as arrays defaulting to `[]`,
provider metadata, and `raw`. Provider response fields that may be absent must remain optional.

Parsers must accept valid empty result responses, reject invalid top-level payloads, and keep
networking concerns out of parser code.

## Configuration and Registration

Centralize provider defaults in `configuration.ts`. Registration must pass enabled state, priority,
timeout, retry policy, and feature flags into `ProviderPluginRegistry`.

Every provider configuration must include:

- Provider identifier input, such as board token, site, or job board name.
- `baseUrl`
- `timeoutMs`
- `userAgent`
- `retryPolicy`
- `enabled`
- `priority`
- `loggingLevel`
- Provider-specific options, such as page size or compensation inclusion.

Feature flags should describe provider capabilities and configuration choices; they must not execute
searches or hide provider-specific logic.

## Plugin Contract

Plugins must expose metadata without executing network calls. The `provider.search` bridge may
return raw provider jobs cast through the current `Job` contract so `SearchService.searchUnified`
can pass them through the certified processing pipeline. Keep a separate `searchRaw` method for
provider-specific tests and raw connector diagnostics.

## Testing

Tests must mock all external behavior and cover configuration, request building, HTTP success and
failure handling, parsing, local filters, pagination if supported, connector orchestration, plugin
registration, discovery, and raw result handoff.

The minimum test set for each provider is:

- `configuration.test.ts`: defaults and invalid configuration.
- `request-builder.test.ts`: URL path, query parameters, and provider-side filters.
- `http-client.test.ts`: headers, invalid JSON, transient retry, non-transient failures, rate-limit
  classification, and abort-style timeout classification.
- `parser.test.ts`: populated payloads, invalid payloads, empty results, and raw snapshots.
- `filters.test.ts`: every supported local filter plus absent-filter behavior.
- `connector.test.ts`: orchestration, pagination or single-payload behavior, and empty results.
- `plugin.test.ts`: metadata, registry registration, raw bridge handoff, and discovery.

## Documentation

Each provider needs `specs/providers/{provider}/SPEC.md`, `docs/providers/{provider}.md`, and a
phase report when introduced.

Provider docs must document the source API, request format, parsed raw fields, intentional
provider-specific differences, error handling, and non-goals. Specs must document supported inputs,
raw fields, non-goals, and verification requirements.

## Intentional Differences

Provider-specific differences are allowed only when the external provider requires them. Current
examples:

- Greenhouse uses link-header pagination and a board token.
- Lever uses skip/limit pagination and supports selected provider-side category filters.
- Ashby uses one board-wide public postings payload and optional compensation inclusion.

## Review Checklist

- No changes to `SearchService`, `SearchProviderRegistry`, or `ProviderPluginRegistry`.
- No real network calls in tests.
- No provider imports another provider.
- No normalization, deduplication, ranking, caching, storage, dashboard, automation, or AI behavior.
- Provider-specific differences are documented.
- A fourth provider can be added as a new folder plus exports and docs without changing existing
  provider folders.
