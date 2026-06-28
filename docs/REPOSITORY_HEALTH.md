# Repository Health

## Phase 0D Review

The repository was reviewed for developer experience, command consistency, documentation clarity,
local automation, and AI readiness.

## Top-Level Directory Status

| Directory      | Status   | Notes                                                                   |
| -------------- | -------- | ----------------------------------------------------------------------- |
| `apps/`        | Active   | Contains the Next.js web shell and local guidance.                      |
| `services/`    | Active   | Contains the FastAPI API shell and local guidance.                      |
| `contracts/`   | Active   | Contains canonical TypeScript domain contracts.                         |
| `packages/`    | Active   | Contains the shared TypeScript package and future package placeholders. |
| `docs/`        | Active   | Contains onboarding docs and phase reports.                             |
| `scripts/`     | Active   | Contains bootstrap, verify, and clean scripts.                          |
| `config/`      | Active   | Contains environment examples.                                          |
| `tests/`       | Reserved | Cross-cutting test structure is documented but not yet populated.       |
| `specs/`       | Reserved | Feature specs are placeholders for future phases.                       |
| `experiments/` | Reserved | Research area is intentionally isolated.                                |
| `playbooks/`   | Active   | Contains repeatable engineering procedures.                             |

## Notes

- `prompts/` is ignored by Git and treated as local/private prompt material.
- Generated folders such as `.venv`, `.next`, `dist`, caches, and `node_modules` are ignored.
- Every tracked major directory has an `AGENTS.md`.
- No product functionality exists as of Phase 0D.
- `pnpm verify` and `docker compose build` pass as of Phase 0D.
