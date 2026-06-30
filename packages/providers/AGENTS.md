# packages/providers AGENTS

## Purpose

`packages/providers/` contains adapter contracts and provider-specific job platform integrations.

## Responsibilities

Own platform boundaries for job search, job detail retrieval, and provider capability metadata.
Phase 3.3 adds the Greenhouse search connector as the first concrete provider plugin; its review
hardening is complete.

## Constraints

Provider code must translate external data into documented internal shapes and must not leak
vendor-specific behavior into domain logic. Greenhouse returns raw provider-specific jobs in Phase
3.3; do not normalize, deduplicate, rank, cache, store, or add other providers until their approved
phases.
