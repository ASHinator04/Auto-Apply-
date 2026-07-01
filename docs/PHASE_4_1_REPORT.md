# Phase 4.1 Report: Search Experience Foundation

## Executive Summary

Phase 4.1 adds the first user-facing search workflow. Users can select a resume, enter criteria,
execute a search, see loading/error/empty/no-results states, retry failures, and receive a unified
search response through the certified `SearchService.searchUnified` boundary.

## User Search Flow

1. Open the Search tab.
2. Use the primary resume by default or select another uploaded resume.
3. Enter required keywords plus optional location and remote preference.
4. Submit the form.
5. Observe loading, error, no-results, or response summary state.

## Components Added

- `SearchExperienceDashboard`
- `SearchForm`
- `SearchEmptyState`
- `SearchErrorState`
- `SearchResponseSummary`
- Search form utilities and typed API client
- Next.js `/api/search` route

## Search Engine Integration

The web route calls `SearchService.searchUnified` and returns `UnifiedSearchResponse`. The UI never
consumes Greenhouse, Lever, Ashby, or other provider-specific raw models.

## Tests Added

- Form validation and request mapping tests.
- Search execution tests with a mocked unified search executor.
- Loading, error, empty, no-results, form, and response summary rendering tests.

## Documentation Updated

- `AGENTS.md`
- `apps/web/AGENTS.md`
- `README.md`
- `MVP_STATUS.md`
- `STATE.md`
- `ARCHITECTURE.md`
- `ENGINEERING_GUIDE.md`
- `docs/API.md`
- `docs/PHASE_4_1_REPORT.md`

## Known Limitations

- The Phase 4.1 route executes the certified search pipeline without configured live provider
  plugins, so local searches can validly return no results.
- Job cards, details, sorting, pagination, sessions, saved searches, persistence, and Job Browser
  workflows are intentionally out of scope.

## Readiness Assessment

READY FOR PHASE 4.2

Phase 4.2 can build Job Browser UI on top of the existing Search tab and `UnifiedSearchResponse`
without changing Search Engine internals.
