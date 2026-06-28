# Scripts

Repository scripts are thin wrappers around the documented package commands. They should stay
simple, non-destructive by default, and free of secrets.

## Commands

- `pnpm bootstrap`: install JavaScript and Python dependencies.
- `pnpm verify`: run formatting checks, lint, type checks, tests, and build.
- `pnpm clean`: remove generated local build and cache outputs.

The package commands use cross-platform commands so CI and local shells run the same workflow.

Use `pnpm dev`, `pnpm dev:web`, or `pnpm dev:api` for local development servers.
