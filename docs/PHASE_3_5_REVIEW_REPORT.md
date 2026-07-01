# Phase 3.5 Review Report: Provider Ecosystem Certification Audit

## Executive Summary

The provider layer was reviewed across the plugin framework, Greenhouse, Lever, Ashby, shared HTTP
infrastructure, tests, and documentation. The architecture remains provider-agnostic and no Phase
3.6 behavior was added.

Architecture Score: 9/10

Provider Framework Score: 9/10

Maintainability Score: 9/10

Extensibility Score: 9/10

## Provider Ecosystem Review

Strengths:

- All three providers use the same module layout and plugin lifecycle.
- Shared HTTP behavior is centralized without hiding provider-specific semantics.
- Parsers return raw provider models only.
- Tests are mocked and cover registration, discovery, configuration, HTTP failures, parsing,
  filtering, and connector orchestration.

Weaknesses addressed during review:

- The provider implementation guide needed more concrete onboarding detail for provider #4.
- Greenhouse still had a stale bridge comment naming Phase 3.5 instead of Phase 3.6.
- Parser tests did not consistently assert valid empty provider responses across all providers.

## Cross-Provider Comparison

| Area          | Greenhouse                | Lever                      | Ashby                             | Intentional Difference     |
| ------------- | ------------------------- | -------------------------- | --------------------------------- | -------------------------- |
| Architecture  | Standard provider folder  | Same                       | Same                              | None                       |
| Lifecycle     | Plugin registry handoff   | Same                       | Same                              | Provider ID/type only      |
| Networking    | Shared JSON helper        | Same                       | Same                              | None                       |
| Parsing       | `{ jobs: [...] }` payload | Posting array payload      | `{ jobs: [...] }` payload         | Source API shape           |
| Models        | Raw Greenhouse job        | Raw Lever job              | Raw Ashby job                     | Provider vocabulary        |
| Configuration | Board token, max pages    | Site, page size, max pages | Job board name, compensation flag | Provider API needs         |
| Logging       | Provider logger           | Same                       | Same                              | None                       |
| Testing       | Mocked provider tests     | Same                       | Same                              | Pagination assertions vary |
| Documentation | Provider spec and doc     | Same                       | Same                              | API details vary           |

## Shared Infrastructure Review

`packages/providers/src/shared/http-json-client.ts` remains the right abstraction boundary. It owns
provider-agnostic timeout, retry, JSON parsing, User-Agent, rate-limit, transient failure, and
abort-style timeout handling. Request builders, pagination, parsers, filters, raw models, and
registration correctly remain provider-specific.

No additional shared abstraction was introduced because the remaining duplication is deliberate
provider structure, not common behavior.

## Code Quality Improvements

- Updated Greenhouse provider bridge comment to point canonical mapping at Phase 3.6.
- Renamed Greenhouse connector error metadata from `context` to `details` to match Lever and Ashby.
- Added empty-response parser coverage for Greenhouse, Lever, and Ashby.
- Expanded `specs/providers/PROVIDER_IMPLEMENTATION_GUIDE.md` with required exports, test matrix,
  configuration requirements, plugin bridge rules, and intentional difference guidance.
- Added this certification report and updated `STATE.md`.

## Performance Review

Provider execution remains bounded and sequential inside each connector. Greenhouse and Lever have
configured page limits. Ashby fetches a single public postings payload. This is appropriate before
aggregation, normalization, caching, or ranking exists.

## Documentation Updated

- `STATE.md`
- `docs/PHASE_3_5_REVIEW_REPORT.md`
- `docs/providers/IMPLEMENTATION_GUIDE.md`
- `specs/providers/PROVIDER_IMPLEMENTATION_GUIDE.md`

## Technical Debt

- Greenhouse, Lever, and Ashby still use raw-provider-to-`Job` bridge casts until Phase 3.6 creates
  canonical normalized mapping.

## Repository Certification

PROVIDER LAYER CERTIFIED

The provider layer is stable, consistent, and extensible. Providers are independent plugins, the
plugin framework remains provider-agnostic, tests are mocked, and a fourth provider can be added as
a new provider folder without modifying the search engine, plugin framework, or existing provider
folders.

## Readiness Assessment

READY FOR PHASE 3.6

The repository is ready for the Search Result Processing Pipeline after explicit approval. Phase 3.6
should consume raw Greenhouse, Lever, and Ashby results and introduce aggregation, normalization,
and deduplication without moving provider-specific logic into the search engine.
