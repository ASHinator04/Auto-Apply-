# Phase 3.6 Report: Search Result Processing Pipeline

## Executive Summary

Phase 3.6 implemented a stateless provider-independent processing pipeline that converts raw
Greenhouse, Lever, and Ashby results into one deterministic canonical job response. No persistence,
dashboard, application workflow, AI, semantic search, or Phase 3.7 certification work was added.

## Pipeline Diagram

```text
Provider raw results
  -> Aggregation
  -> Normalization
  -> Validation
  -> Deduplication
  -> Quality filtering
  -> Ranking
  -> Unified search response
```

## Canonical Job Model

`CanonicalJob` includes common job fields only: provider identity, provider job id, source URL,
title, company, description, locations, work mode, department, team, employment type, compensation,
posted date, discovery date, and provider metadata.

## Validation Strategy

Validation excludes jobs with missing title, missing provider id, missing provider job id, invalid
source URL, or corrupt provider metadata. Errors are structured and included in the unified
response.

## Deduplication Strategy

Deduplication uses exact provider id, URL, and company/title/location keys. Tie-breaking is
deterministic: provider precedence, completeness, then stable id.

## Ranking Strategy

Ranking uses deterministic keyword relevance, posting recency, and provider priority. The ranking
module is replaceable and uses no AI or semantic matching.

## Components Added

- `packages/domain/src/search/processing/types.ts`
- `packages/domain/src/search/processing/aggregation.ts`
- `packages/domain/src/search/processing/normalization.ts`
- `packages/domain/src/search/processing/validation.ts`
- `packages/domain/src/search/processing/deduplication.ts`
- `packages/domain/src/search/processing/quality-filter.ts`
- `packages/domain/src/search/processing/ranking.ts`
- `packages/domain/src/search/processing/pipeline.ts`

## Tests Added

Added unit tests for aggregation, normalization, validation, quality filtering, deduplication,
ranking, and the end-to-end cross-provider pipeline. The pipeline test verifies one canonical job is
returned when the same logical job appears in Greenhouse, Lever, and Ashby.

## Documentation Updated

- `ARCHITECTURE.md`
- `DECISIONS.md`
- `README.md`
- `STATE.md`
- `packages/domain/AGENTS.md`
- `specs/search/SPEC.md`
- `docs/search/AGENTS.md`
- `docs/search/PIPELINE.md`
- `docs/search/NORMALIZATION.md`
- `docs/search/DEDUPLICATION.md`
- `docs/search/RANKING.md`

## Known Limitations

- The pipeline accepts raw provider result collections but is not yet wired into a user-facing API.
- Results are not persisted.
- Deduplication is exact only.
- Ranking is deterministic and simple by design.

## Readiness Assessment

READY FOR PHASE 3.7 - Search Engine Certification.

Phase 3.7 should certify the search engine end to end without introducing persistence, dashboard,
automation, AI, or application workflows.
