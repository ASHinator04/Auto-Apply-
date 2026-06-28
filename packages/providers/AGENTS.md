# packages/providers AGENTS

## Purpose

`packages/providers/` will contain adapter contracts and provider-specific job platform
integrations.

## Responsibilities

Own platform boundaries for job search, job detail retrieval, and provider capability metadata.

## Constraints

Provider code must translate external data into documented internal shapes and must not leak
vendor-specific behavior into domain logic.
