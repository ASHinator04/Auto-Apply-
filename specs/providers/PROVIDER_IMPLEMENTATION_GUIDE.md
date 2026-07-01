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

## Naming

Use provider-prefixed names such as `AshbySearchConnector`, `RawAshbyJob`,
`createAshbyProviderPlugin`, and `buildAshbyJobsUrl`. Provider IDs use `{provider}:{board-or-site}`.

## Networking

Use `requestJsonWithRetry` for timeout, User-Agent, retry, rate-limit, transient failure, invalid
JSON, and abort-style timeout behavior. Keep pagination and URL semantics inside the provider.

## Parsing and Models

Parse only fields exposed by the provider. Do not infer missing values, normalize jobs, deduplicate,
rank, cache, or store results. Include provider metadata and a shallow raw payload snapshot.

## Configuration and Registration

Centralize provider defaults in `configuration.ts`. Registration must pass enabled state, priority,
timeout, retry policy, and feature flags into `ProviderPluginRegistry`.

## Testing

Tests must mock all external behavior and cover configuration, request building, HTTP success and
failure handling, parsing, local filters, pagination if supported, connector orchestration, plugin
registration, discovery, and raw result handoff.

## Documentation

Each provider needs `specs/providers/{provider}/SPEC.md`, `docs/providers/{provider}.md`, and a
phase report when introduced.

## Review Checklist

- No changes to `SearchService`, `SearchProviderRegistry`, or `ProviderPluginRegistry`.
- No real network calls in tests.
- No provider imports another provider.
- No normalization, deduplication, ranking, caching, storage, dashboard, automation, or AI behavior.
- Provider-specific differences are documented.
