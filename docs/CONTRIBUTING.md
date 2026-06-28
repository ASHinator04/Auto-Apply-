# Contributing

## Workflow

1. Read `AGENTS.md`, `PROJECT_PLAN.md`, `STATE.md`, and the nearest local `AGENTS.md`.
2. Confirm the work belongs to the current approved phase.
3. Keep changes scoped to that phase.
4. Run `pnpm verify`.
5. Update documentation when behavior, commands, structure, or decisions change.
6. Commit with a clear imperative message.

## Branching

`main` is the current integration branch. Use short-lived branches when collaboration requires pull
requests. Keep phase work in scoped commits.

## Commit Messages

Use concise imperative messages:

```text
Improve Phase 0D developer workflow
Add resume contract definitions
Fix API schema placement
```

## Code Rules

- Do not implement future phases early.
- Keep domain contracts framework-independent.
- Put FastAPI schema models in `schema.py`.
- Avoid dependencies unless they remove real friction.
- Prefer explicit imports and small files.

## Verification

Run before committing:

```powershell
pnpm verify
```

For Docker changes, also run:

```powershell
docker compose build
```

## Documentation

Documentation is part of implementation. Update the smallest owning document:

- `STATE.md` for current status.
- `ENGINEERING_GUIDE.md` for engineering practice.
- `ARCHITECTURE.md` for boundaries.
- `DECISIONS.md` for durable decisions.
- Local `AGENTS.md` files for directory-specific rules.
