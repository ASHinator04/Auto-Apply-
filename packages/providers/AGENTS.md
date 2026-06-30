# packages/providers AGENTS

## Purpose

`packages/providers/` contains adapter contracts and provider-specific job platform integrations.

## Responsibilities

Own platform boundaries for job search, job detail retrieval, and provider capability metadata.
Phase 3.3 adds the Greenhouse search connector as the first concrete provider plugin. Phase 3.4 adds
the Lever search connector using the same structure. Shared provider-only infrastructure lives in
`packages/providers/src/shared`.

## Constraints

Provider code must translate external data into documented internal shapes and must not leak
vendor-specific behavior into domain logic. Greenhouse and Lever return raw provider-specific jobs
in their current phases; do not normalize, deduplicate, rank, cache, store, or add other providers
until their approved phases. Use shared provider utilities only for behavior that is identical
across implemented providers; keep request builders, pagination, parsing, filters, raw models, and
plugin registration provider-specific.
