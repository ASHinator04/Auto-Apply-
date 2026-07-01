# Phase 3.5 Report: Ashby Connector and Provider Standardization

## Executive Summary

Phase 3.5 implemented Ashby as the third raw job provider and codified the provider implementation
standard. Greenhouse, Lever, and Ashby now follow the same provider folder architecture while
preserving provider-specific request building, parsing, filtering, and pagination behavior.

## Provider Implementation Guide Summary

The canonical guide now lives at `specs/providers/PROVIDER_IMPLEMENTATION_GUIDE.md`. It defines the
required module layout, naming rules, networking boundary, parser/model rules, registration
expectations, test checklist, documentation expectations, and review checklist for future providers.

## Ashby Components Added

- `packages/providers/src/ashby/configuration.ts`
- `packages/providers/src/ashby/request-builder.ts`
- `packages/providers/src/ashby/http-client.ts`
- `packages/providers/src/ashby/parser.ts`
- `packages/providers/src/ashby/models.ts`
- `packages/providers/src/ashby/filters.ts`
- `packages/providers/src/ashby/connector.ts`
- `packages/providers/src/ashby/plugin.ts`
- `packages/providers/src/ashby/registration.ts`
- `packages/providers/src/ashby/logger.ts`
- `packages/providers/src/ashby/errors.ts`

## Cross-Provider Comparison

| Area             | Greenhouse               | Lever                            | Ashby                                     |
| ---------------- | ------------------------ | -------------------------------- | ----------------------------------------- |
| Plugin lifecycle | Provider plugin registry | Same                             | Same                                      |
| HTTP behavior    | Shared JSON helper       | Same                             | Same                                      |
| Request shape    | Board token jobs URL     | Site postings URL                | Job board postings URL                    |
| Pagination       | Link header              | Skip/limit                       | Not supported by public postings endpoint |
| Raw model        | Greenhouse job fields    | Lever posting fields             | Ashby posting fields                      |
| Filtering        | Local raw-field filters  | Provider-side plus local filters | Local raw-field filters                   |
| Normalization    | Out of scope             | Out of scope                     | Out of scope                              |

## Tests Added

Ashby tests cover configuration, request building, HTTP success/failure handling, invalid JSON, rate
limits, timeout classification, parsing, raw payload snapshots, local filters, connector
orchestration, empty responses, plugin registration, discovery, and raw result handoff.

## Documentation Updated

- `AGENTS.md`
- `README.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `STATE.md`
- `TODO.md`
- `packages/providers/AGENTS.md`
- `docs/providers/IMPLEMENTATION_GUIDE.md`
- `docs/providers/ashby.md`
- `specs/providers/PROVIDER_IMPLEMENTATION_GUIDE.md`
- `specs/providers/ashby/SPEC.md`

## Known Limitations

- Ashby results are raw provider-specific postings.
- Ashby public postings search is local filtering over returned fields.
- The public postings endpoint is not paginated.
- No aggregation, normalization, deduplication, ranking, caching, storage, dashboard, or automation
  exists yet.

## Lessons Learned

The shared provider JSON helper now cleanly supports a third connector without changing Greenhouse,
Lever, the search engine, or the plugin framework. Provider-specific differences are best isolated
in request builders, parsers, models, and filters.

## Readiness Assessment

READY FOR PHASE 3.6.

The repository is ready for aggregation, normalization, and deduplication after explicit approval.
Phase 3.6 should consume raw Greenhouse, Lever, and Ashby results without moving provider-specific
logic into the search engine.
