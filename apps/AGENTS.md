# apps AGENTS

## Purpose

`apps/` will contain deployable user-facing applications, such as a future web dashboard.

## Responsibilities

Applications should own presentation, routing, user interaction, and composition of shared modules.

## Constraints

Do not place domain rules, provider integrations, browser automation, or persistence details directly in application code. Applications should depend on stable package interfaces.

## Extension Guidelines

Create a child directory and local `AGENTS.md` for each app before implementation begins.
