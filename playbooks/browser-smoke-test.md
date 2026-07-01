# Browser Smoke Test

Use this checklist after a phase or review hardening pass. It verifies the current user-facing
surface without pulling in future phase work.

## Start

```powershell
pnpm dev
```

Open `http://127.0.0.1:3000` and confirm the API health endpoint responds at
`http://127.0.0.1:8000/health`.

## Dashboard Checks

1. Confirm the Knowledge Base tab loads without browser console hydration errors.
2. Create a short-answer knowledge entry.
3. Create a long-form behavioral answer.
4. Edit an entry, cancel, and confirm the original value remains.
5. Edit again, save, search for the new text, then delete the entry.
6. Switch to Resumes and confirm the empty state or existing rows render.
7. Try uploading a non-PDF and confirm validation blocks it.
8. Upload a small test PDF, rename it, optionally replace it, and delete it.
9. Collapse and reopen the Activity Log and confirm actions are recorded.
10. Repeat the main tab switch and form checks at a narrow mobile viewport.

## Finish

Run the repository verification command:

```powershell
pnpm verify
```

Record issues in a dated `docs/QA_SMOKE_REPORT_YYYY_MM_DD.md` file with reproduction steps, expected
behavior, actual behavior, and follow-up TODOs.
