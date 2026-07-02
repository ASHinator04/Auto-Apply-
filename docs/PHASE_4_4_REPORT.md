# Phase 4.4 Report: Search Sessions

## Executive Summary

Phase 4.4 introduces lightweight in-memory Search Sessions in the web app. Every successful search
now creates one active session containing the submitted search request, unified search response,
search timestamp, status, selected jobs, and summary metadata. The Job Browser and Job Details read
results and selection from the active session, making the session the source of truth for future
application queue and tracking phases.

## Session Lifecycle

The implemented lifecycle is create, activate, retrieve, update, and deactivate active session.
Successful searches create and activate a new session. Starting another search deactivates the
current session while the request is loading, then activates the new session after success. Closing
and deletion are intentionally not implemented.

## Session Model

`SearchSession` lives in `apps/web/app/search-session.ts` and contains:

- `id`
- `request`
- `searchTimestamp`
- `status`
- `response`
- `selectedJobIds`
- `metadata`

The response is held by reference to avoid duplicating large job collections during selection
updates.

## Browser Integration

`SearchExperienceDashboard` owns the session state and passes the active session into `JobBrowser`.
`JobBrowser` still owns only browser UI state such as filters, sorting, pagination, and the current
details panel. Search results now come from `session.response`.

## Selection Ownership

Selection belongs to the active search session. Individual selection, visible-job selection, details
selection, and clear selection all update `selectedJobIds` on the session. Unknown job IDs are
ignored so selected jobs always belong to the session's current result set.

## Components Added

- `apps/web/app/search-session.ts`: session model, lifecycle helpers, retrieval helpers, and
  selection helpers.
- Session-aware wiring in `SearchExperienceDashboard`.
- Session-aware `JobBrowser` and Job Details selection integration.

## Tests Added

- Session creation with request, response, timestamp, status, and metadata.
- Session activation, retrieval, update, and deactivation.
- Selection persistence, bulk selection, deselection, clearing, and unknown job ID handling.
- Browser rendering from active session selection.

## Documentation Updated

- `AGENTS.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `ENGINEERING_GUIDE.md`
- `MVP_STATUS.md`
- `README.md`
- `STATE.md`
- `apps/web/AGENTS.md`
- `docs/PHASE_4_4_REPORT.md`

## Known Limitations

- Sessions are in-memory only and are lost on hard refresh.
- Session retrieval is available through the frontend session state, but there is no route,
  persistence layer, sharing, deletion, or history UI.
- Application Queue, Auto Apply, Application Tracking, saved searches, and analytics remain out of
  scope.

## Readiness Assessment

The repository is ready for Phase 4.5: Search Experience Certification after explicit user approval.
Search Sessions now own request, response, and selected jobs while preserving Search Engine and
Search API boundaries.
