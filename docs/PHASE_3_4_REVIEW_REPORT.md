# Phase 3.4 Review Report: Lever Connector and Cross-Provider Consistency Audit

## Executive Summary

Phase 3.4 was reviewed against Greenhouse, the provider plugin framework, and the approved phase
scope. Greenhouse and Lever follow the same provider architecture: configuration, request builder,
HTTP client, parser, raw model, filters, connector, plugin, registration, tests, and docs. The
review extracted duplicated JSON HTTP request behavior into shared provider infrastructure while
keeping provider-specific request building, pagination, parsing, and filtering isolated.

Architecture Score: 9/10. Consistency Score: 9/10. Maintainability Score: 9/10.

## Connector Comparison

| Area          | Greenhouse                                                    | Lever                                                           | Intentional Difference          |
| ------------- | ------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------- |
| Architecture  | Provider folder with isolated modules                         | Same folder and module pattern                                  | None                            |
| Lifecycle     | Plugin registration through `ProviderPluginRegistry`          | Same registry and raw bridge pattern                            | Provider type/id only           |
| Networking    | Shared JSON request helper plus same-origin link pagination   | Shared JSON request helper plus skip/limit pagination           | Pagination is provider-specific |
| Parsing       | Parses `{ jobs: [...] }` into raw Greenhouse jobs             | Parses posting arrays into raw Lever jobs                       | API payload shape differs       |
| Configuration | Board token, base URL, timeout, retries, logging, max pages   | Site, base URL, timeout, retries, logging, max pages, page size | Lever requires page size        |
| Testing       | Mocked config, HTTP, parser, filters, connector, plugin tests | Same mocked test categories                                     | Lever tests cover skip/limit    |
| Documentation | Provider doc, spec, phase report                              | Provider doc, spec, phase report                                | Provider API details differ     |

## Shared Infrastructure Review

Duplicated HTTP behavior across Greenhouse and Lever was moved to
`packages/providers/src/shared/http-json-client.ts`. The helper now owns:

- Timeout setup.
- User-Agent and JSON request headers.
- Transient retry handling.
- `Retry-After` parsing.
- Rate-limit and provider-down error mapping.
- Invalid JSON classification.
- Abort-style timeout classification.

Pagination, request builders, parsers, filters, raw models, and plugin registration remain
provider-specific.

## Code Quality Improvements

- Removed duplicated retry/timeout/JSON parsing code from both provider HTTP clients.
- Added a provider-only shared utility with provider-specific error factories.
- Documented the provider implementation pattern for Ashby and later connectors.
- Synchronized phase docs so Phase 3.5 is Ashby and Phase 3.6 owns aggregation/normalization.

## Performance Review

Both providers still use bounded sequential pagination. This is appropriate for the current raw
provider phase because provider counts are small, tests are deterministic, and no aggregation or
ranking exists yet. No caching or parallel execution was added.

## Documentation Updated

- `AGENTS.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `ENGINEERING_GUIDE.md`
- `STATE.md`
- `packages/providers/AGENTS.md`
- `docs/providers/IMPLEMENTATION_GUIDE.md`
- `docs/PHASE_3_4_REVIEW_REPORT.md`

## Technical Debt

- Raw provider objects still require Phase 3.6 normalization before cross-provider comparison.
- Provider-specific filter support depends on each public API's exposed fields.

## Readiness Assessment

READY FOR PHASE 3.5 (Ashby).

Ashby can be implemented as a new provider folder following the Greenhouse and Lever pattern without
modifying the search engine, plugin framework, Greenhouse, or Lever. Shared HTTP behavior is now
available for common JSON API access, while provider-specific pagination and parsing remain local to
each connector.
