# Phase 3.3 Review Report: Greenhouse Search Connector Audit

## Executive Summary

Phase 3.3 was reviewed against the approved provider plugin architecture. The Greenhouse connector
remains scoped to raw public board search and does not add normalization, deduplication, ranking,
storage, dashboard integration, or additional providers. Review hardening improved response safety,
pagination validation, timeout classification, raw payload handling, and test coverage.

## Architecture & Integration Score

Score: 9/10.

The connector integrates cleanly through `@job-agent/providers` and the existing provider plugin
framework without modifying the search engine, plugin registry, or domain contracts. The remaining
gap is expected: canonical job normalization belongs to Phase 3.6.

## Connector Review

The connector keeps Greenhouse-specific behavior isolated behind configuration, request building,
HTTP access, parsing, filtering, and plugin registration modules. It returns raw Greenhouse job
objects only.

## Search Flow Review

Search flow remains provider-specific and bounded:

1. Build the Greenhouse public board jobs request.
2. Fetch JSON with configured timeout, headers, retries, and rate-limit handling.
3. Follow same-origin pagination up to `maxPages`.
4. Parse available fields without inventing values.
5. Apply supported local filters.
6. Return raw provider results through the plugin contract.

## HTTP Client Review

The HTTP client now treats invalid JSON as `invalid_response` without retrying, classifies
abort-style errors as `timeout`, and ignores pagination links outside the configured Greenhouse API
origin.

## Parser Review

The parser continues to extract only known Greenhouse fields. Raw top-level payloads are shallow
copied before being returned so later caller-side mutation cannot change the stored raw reference.

## Plugin Integration Review

Plugin metadata, capability exposure, registration helpers, and ready-provider handoff remain
compatible with Phase 3.2. No provider-specific logic was added to the domain search engine.

## Code Quality Improvements

- Added same-origin pagination validation.
- Added invalid JSON response classification.
- Broadened abort-style timeout detection.
- Added raw payload snapshotting.
- Added focused tests for each review hardening behavior.

## Performance Review

The connector still performs simple sequential pagination bounded by `maxPages`. No caching,
parallel provider execution, ranking, or storage was added in this phase.

## Documentation Updated

- `AGENTS.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `STATE.md`
- `docs/providers/greenhouse.md`
- `docs/PHASE_3_3_REPORT.md`
- `docs/PHASE_3_3_REVIEW_REPORT.md`

## Technical Debt

- Greenhouse filtering remains limited to public board fields.
- Raw provider objects still require Phase 3.6 normalization before cross-provider comparison.
- Additional provider behavior patterns should continue to be compared during later provider phases.

## Readiness Assessment

Ready for Phase 3.4 after explicit user approval.

Phase 3.4 should add Lever as an independent provider plugin without changing the search engine or
implementing Ashby, normalization, deduplication, ranking, storage, dashboard integration, or
application workflows.
