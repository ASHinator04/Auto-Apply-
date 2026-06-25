# config AGENTS

## Purpose

`config/` will contain shared configuration templates and repository-level configuration references.

## Responsibilities

Use this directory for non-secret templates, examples, and shared configuration guidance.

## Constraints

Never commit real secrets, tokens, credentials, or personal data. Configuration should support local development and low-cost operation by default.

## Extension Guidelines

Prefer example files with explicit placeholders, such as `.env.example`, once a runtime stack is selected.
