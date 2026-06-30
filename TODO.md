# TODO

## Post-Phase Backlog

These items were requested outside the active phase flow. They can be completed between phases when
explicitly requested and should not pull future phase functionality forward.

- Review and approve Phase 2 user knowledge base hardening.
- Fix the Activity Log hydration mismatch caused by runtime-generated initial timestamps.
- Refresh `README.md` so current status and Quick Start match the Phase 3.4 repository state.
- Add stable row/action test selectors for Knowledge and Resume dashboard QA automation.
- Add a documented local QA reset/seed workflow for repeatable first-run testing.
- Add a repeatable browser smoke-test playbook for future phase reviews.

## Phase-Scoped Backlog

These items are tied to planned phases and should not be implemented until the corresponding phase
starts or is explicitly approved.

### Next

- Decide whether Python runtime models should be generated from or manually mirrored from
  `@job-agent/contracts`.
- Prepare Phase 3.5 Ashby connector after explicit approval.

### Later

- Implement job provider adapters in Phase 3.

### Future Ideas

- Local dashboard for application tracking.
- Provider-specific application strategies.
- Resume-to-job matching assistance.
- Application answer recommendation system.
- Exportable audit history for applications.
