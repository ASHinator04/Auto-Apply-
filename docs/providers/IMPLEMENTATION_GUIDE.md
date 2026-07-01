# Provider Implementation Guide

## Purpose

Use `specs/providers/PROVIDER_IMPLEMENTATION_GUIDE.md` as the canonical provider implementation
standard. This document is a short operational pointer for provider maintainers.

Greenhouse, Lever, and Ashby are the current reference implementations.

## Required Structure

Each provider folder must contain configuration, connector, errors, filters, HTTP client, logger,
models, parser, plugin, registration, request builder, matching mocked tests, and `index.ts`.

Provider-specific code must stay in the provider folder. Shared code belongs in
`packages/providers/src/shared` only when it is independent of provider payload shape, pagination,
filtering, and search semantics.

## Ownership Rules

Provider modules own provider-specific behavior only:

- URL construction.
- Pagination rules.
- Response parsing.
- Raw provider models.
- Provider-side and local filters.
- Plugin metadata and feature flags.

Use `packages/providers/src/shared` for common JSON HTTP behavior only. Do not move parsing,
pagination, or filter behavior into shared code unless at least two providers truly use the same
provider semantics.

## Search Flow

1. Create configuration.
2. Build a provider request URL.
3. Fetch JSON through the provider HTTP client.
4. Parse into a raw provider model.
5. Apply supported local filters.
6. Return raw results through the plugin bridge.

`SearchService.searchUnified` consumes this bridge output and runs the certified processing
pipeline. Provider folders must still not normalize, deduplicate, rank, cache, store, or render
jobs.

See the canonical spec for naming, review checklist, documentation expectations, and cross-provider
consistency rules.

## Testing Checklist

Add mocked tests for configuration, request building, HTTP retries and failures, parsing, filters,
pagination, connector orchestration, plugin registration, discovery, and raw result handoff. Do not
perform real network requests in automated tests.

## Phase Boundaries

Do not add aggregation, normalization, deduplication, ranking, storage, dashboard integration,
application logic, browser automation, or AI behavior inside provider folders.
