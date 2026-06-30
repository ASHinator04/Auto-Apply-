# QA Smoke Report: Local Application Walkthrough

## Executive Summary

The local app starts successfully and the implemented user-facing scope works: Knowledge Base CRUD,
simple search, Resume metadata management, and the frontend activity log are usable. The current UI
correctly exposes only Phase 1 and Phase 2 product functionality; Phase 3 provider work remains
package/backend infrastructure and is not surfaced in the dashboard yet, which matches the plan.

Primary issues found are developer-quality and onboarding issues rather than blocking product
workflow failures: the activity log causes React hydration mismatches, README status/quick-start
content is stale and malformed, and repeated row controls need stronger test/accessibility hooks.

## Environment

- OS: Windows / PowerShell.
- Web: `http://127.0.0.1:3000`.
- API: `http://127.0.0.1:8000`.
- Command used: `pnpm dev`.
- Verification also run: `pnpm verify`.

## What Works

- Web app loads with HTTP 200.
- API `/health` and `/version` return OK.
- Knowledge Base lists persisted entries.
- Knowledge Base create, search, edit, and delete worked with synthetic QA data.
- Resume dashboard lists persisted resumes.
- Resume upload validation blocks submission without a selected PDF.
- Resume metadata created through the local API appears in the UI after refresh/tab switch.
- Resume rename and delete worked with synthetic QA data.
- Existing primary resume remained intact after QA cleanup.
- Activity log records API and UI actions.
- Activity log hide/show toggle works.
- Mobile-width check showed no horizontal page overflow.
- Full repository verification passed.

## Issues Found

### Hydration mismatch in Activity Log

The browser console reports React hydration failures on first load. The mismatch is caused by
server-rendered activity log timestamps differing from client-rendered timestamps. The UI recovers,
but this should be fixed before the logger becomes a larger debugging surface.

Likely source: `apps/web/app/activity-log-store.ts` initializes entries with `crypto.randomUUID()`
and `new Date().toISOString()` at module load, while `ActivityLogPanel` renders the timestamp during
SSR and hydration.

### README is stale and malformed

`README.md` says the project is at Phase 2 and that Phase 3 requires approval, but `STATE.md` says
Phase 3.4 review is complete and Phase 3.5 is next. The Quick Start section is also collapsed into
one sentence instead of separate steps.

### QA-first row targeting is weak

Resume rows and repeated action buttons do not expose stable `data-testid` values. Browser testing
had to rely on article order after confirming newest-first sorting. This is workable but brittle for
future automated QA.

### New-user state is not directly testable

The local database already contains real persisted data, so a true empty first-run experience was
not verified without resetting local state. A documented dev reset/seed workflow would make future
QA passes safer and more repeatable.

## Phase Alignment

The repository is still aligned with the approved plan:

- Phase 1 Resume Management is user-facing and usable.
- Phase 2 Knowledge Base is user-facing and usable.
- Phase 3.1 through 3.4 search/provider work is implemented as infrastructure/packages only.
- No Ashby, aggregation, normalization, deduplication, ranking, dashboard search UI, automation, or
  application flow appeared in the UI.

## TODOs

- Fix Activity Log hydration mismatch.
- Refresh README current status and Quick Start formatting.
- Add stable row/action test selectors for Knowledge and Resume dashboards.
- Add a documented local QA reset/seed workflow.
- Add a repeatable browser smoke-test playbook for future phase reviews.

## Cleanup

Synthetic Knowledge Base and Resume records created during this QA pass were deleted. The original
persisted Sponsorship entry and existing primary resume remain.
