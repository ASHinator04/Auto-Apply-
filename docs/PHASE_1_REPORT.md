# Phase 1 Report

## Executive Summary

Phase 1 delivers the first product workflow: resume management. Users can open the web app, upload
PDF resumes, view stored metadata, rename resumes, replace resume metadata while preserving
identity, delete resumes, and select one primary resume.

## User Workflow

1. Open the resume dashboard.
2. Upload a PDF with an optional display name.
3. View resumes sorted newest first with upload date, file size, version, and primary status.
4. Rename a resume inline.
5. Replace a resume PDF to increment its version without changing its ID.
6. Set another resume as primary.
7. Delete non-primary resumes, or change primary before deleting the current primary.

## APIs Added

- `GET /resumes`
- `POST /resumes`
- `PATCH /resumes/{resume_id}`
- `PUT /resumes/{resume_id}/file`
- `PUT /resumes/{resume_id}/primary`
- `DELETE /resumes/{resume_id}`

See `docs/API.md` for request details.

## UI Components Added

- `ResumeDashboard`
- `EmptyResumeState`
- Resume API client and UI utilities under `apps/web/app`.

## Backend Components Added

- Resume schemas in `schema.py`.
- Resume router in `resume_routes.py`.
- Resume validation/service layer in `resume_service.py`.
- SQLite metadata repository in `resume_repository.py`.
- Resume-specific error types in `resume_errors.py`.

## Tests Added

- API tests for upload, list, rename, replace, delete, primary switching, invalid uploads, empty and
  malformed PDFs, large files, duplicate names, missing resumes, and persistence through SQLite
  metadata.
- Frontend tests for file validation, size validation, formatting, sorting, and empty-state
  rendering.
- Contract test update for resume `version` and `isPrimary` metadata.

## Verification

- `pnpm verify` passed.
- Local API runtime probe passed: `/health` returned OK and `/resumes` returned an empty list.
- Local web runtime probe passed: `http://localhost:3000` returned HTTP 200.
- Docker Compose build and runtime probes pass after Docker Desktop is running.
- Phase 1 review hardening added stricter SQLite primary consistency, clearer UI validation, more
  robust API error parsing, and additional edge-case tests.

## Documentation Updated

- `README.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `STATE.md`
- `ROADMAP.md`
- `TODO.md`
- Local `AGENTS.md` files.
- `specs/resume/SPEC.md`
- `docs/API.md`
- `docs/PHASE_1_REVIEW_REPORT.md`

## Known Limitations

- Resume file bytes are not persisted; Phase 1 stores metadata only.
- There is no authentication or multi-user ownership.
- The dashboard depends on the local API being available.

## Technical Debt

- Python schemas are still manually mirrored from TypeScript contracts.
- The local SQLite repository is intentionally simple and has no migration framework yet.

## Readiness Assessment

The repository is ready for Phase 2 after explicit approval. Phase 1 is scoped, tested, documented,
and does not implement knowledge base, job search, AI, or automation behavior.
