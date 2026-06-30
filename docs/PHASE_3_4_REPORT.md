# Phase 3.4 Report: Lever Search Connector

## Executive Summary

Phase 3.4 implements the Lever search connector as the second concrete provider plugin. It mirrors
the Greenhouse connector architecture and does not modify the search engine, provider registry,
plugin framework, or shared contracts. The connector returns raw Lever posting objects; aggregation,
normalization, deduplication, ranking, caching, and storage remain deferred to later phases.

## Components Added

- Lever connector.
- Lever HTTP client.
- Lever request builder.
- Lever response parser.
- Raw Lever job model.
- Lever filter helpers.
- Lever configuration.
- Lever provider plugin and registration helpers.
- Lever provider tests.

## Search Flow

1. A Lever plugin is created from connector configuration.
2. The plugin exposes metadata and registers through `ProviderPluginRegistry`.
3. The connector builds the public Lever postings URL with `mode=json`, `skip`, and `limit`.
4. Provider-side filters are added for location, team, department, and commitment when supplied.
5. The HTTP client fetches JSON with timeout, User-Agent, retry, rate-limit handling, invalid JSON
   classification, and timeout classification.
6. Pagination continues until a short page is returned or `maxPages` is reached.
7. The parser extracts available Lever fields without inventing missing values.
8. Local filters apply keyword and remote checks where raw fields allow it.
9. Raw Lever postings are returned through the provider contract bridge.

## Differences from Greenhouse

- Lever uses a site name instead of a Greenhouse board token.
- Lever uses `skip` and `limit` pagination instead of `Link: rel="next"`.
- Lever returns an array of postings instead of a `{ jobs: [...] }` payload.
- Lever supports provider-side category filters for location, team, department, and commitment.
- Lever does not provide full-text search, so keyword matching remains local.

## Tests Added

- Configuration tests.
- Request builder tests.
- Parser tests.
- Filter tests.
- Mocked HTTP client tests.
- Connector tests with mocked skip/limit pagination.
- Plugin registration and raw result handoff tests.

All provider tests avoid real network requests.

## Documentation Updated

- `AGENTS.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `ROADMAP.md`
- `STATE.md`
- `TODO.md`
- `docs/providers/lever.md`
- `docs/PHASE_3_4_REPORT.md`
- `packages/providers/AGENTS.md`
- `specs/providers/lever/SPEC.md`

## Known Limitations

- Only Greenhouse and Lever are implemented.
- Ashby is not implemented.
- No aggregation, normalization, deduplication, ranking, caching, storage, dashboard, search UI, or
  browser automation exists.
- Lever keyword and remote filtering are constrained by public posting fields and may be applied
  locally.
- Public posting availability depends on the Lever site name.

## Lessons Learned

Lever validates the provider plugin framework against a second API shape. The existing Greenhouse
module boundaries were sufficient, and no search engine or registry changes were required.

## Readiness Assessment

The repository is ready for Phase 3.5 after explicit approval. Ashby should be implemented as an
independent provider plugin without changing the search engine or plugin framework.
