# scripts AGENTS

## Purpose

`scripts/` contains repository automation for development, verification, maintenance, and
documentation tasks.

## Responsibilities

Scripts should make repeated repository tasks consistent and easy to run locally. Current package
commands support bootstrap and verification; `scripts/clean.mjs` handles generated-file cleanup.

## Constraints

Scripts must be documented, non-destructive by default, and avoid embedding secrets. Prefer simple
commands over complex custom tooling.

## Extension Guidelines

Add scripts only when they remove repeated manual effort. Document required inputs and expected
outputs in comments or adjacent docs.
