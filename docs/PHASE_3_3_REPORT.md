# Phase 3.3 Report: Greenhouse Search Connector

## Executive Summary

Phase 3.3 implements the Greenhouse search connector as the first concrete provider plugin. It uses
the existing provider plugin framework and does not modify the search engine or plugin registry. The
connector returns raw Greenhouse-specific job objects; normalization remains deferred to Phase 3.5.

## Search Flow

1. A Greenhouse plugin is created from connector configuration.
2. The plugin exposes metadata and registers through `ProviderPluginRegistry`.
3. The connector builds the public Greenhouse jobs URL with `content=true`.
4. The HTTP client fetches JSON with timeout, User-Agent, retry, and rate-limit handling.
5. Pagination follows `Link: rel="next"` up to `maxPages`.
6. The parser extracts available Greenhouse fields without inventing missing values.
7. Local filters apply keyword, location, remote preference, and department checks where raw fields
   allow it.
8. Raw Greenhouse jobs are returned through the provider contract bridge.

## Components Added

- `@job-agent/providers` package.
- Greenhouse connector.
- Greenhouse HTTP client.
- Greenhouse request builder.
- Greenhouse response parser.
- Raw Greenhouse job model.
- Greenhouse filter helpers.
- Greenhouse configuration.
- Greenhouse provider plugin and registration helpers.

## Test Results

- Configuration tests.
- Request builder tests.
- Parser tests.
- Filter tests.
- Mocked HTTP client tests.
- Connector tests with mocked pagination.
- Plugin registration and raw result handoff tests.

All provider tests avoid real network requests.

## Documentation Updated

- `AGENTS.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `ENGINEERING_GUIDE.md`
- `ROADMAP.md`
- `STATE.md`
- `TODO.md`
- `docs/providers/greenhouse.md`
- `docs/PHASE_3_3_REPORT.md`
- `packages/providers/AGENTS.md`
- `specs/providers/greenhouse/SPEC.md`

## Known Limitations

- Only Greenhouse is implemented.
- No normalization, deduplication, ranking, caching, storage, dashboard, search UI, or browser
  automation exists.
- Greenhouse filters are constrained by public board fields and may be applied locally.
- Public board availability depends on the customer board token.

## Lessons Learned

Greenhouse exposes a simple public JSON endpoint, but provider data can omit fields. Future
providers should keep raw models explicit and avoid guessing missing values.

## Readiness Assessment

The repository is ready for Phase 3.4 after explicit approval. Lever and Ashby should be implemented
as independent provider plugins without changing the search engine or plugin framework.
