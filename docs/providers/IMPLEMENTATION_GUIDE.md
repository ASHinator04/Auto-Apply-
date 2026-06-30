# Provider Implementation Guide

## Purpose

Use this guide when adding the next job provider. Greenhouse and Lever are the reference
implementations.

## Required Structure

Each provider folder should contain:

- `configuration.ts`
- `connector.ts`
- `errors.ts`
- `filters.ts`
- `http-client.ts`
- `logger.ts`
- `models.ts`
- `parser.ts`
- `plugin.ts`
- `registration.ts`
- `request-builder.ts`
- matching `*.test.ts` files
- `index.ts`

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

## Testing Checklist

Add mocked tests for configuration, request building, HTTP retries and failures, parsing, filters,
pagination, connector orchestration, plugin registration, discovery, and raw result handoff. Do not
perform real network requests in automated tests.

## Phase Boundaries

Do not add aggregation, normalization, deduplication, ranking, storage, dashboard integration,
application logic, browser automation, or AI behavior from provider phases.
