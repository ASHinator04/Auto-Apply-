# services/api AGENTS

## Purpose

`services/api/` contains the FastAPI backend service shell.

## Responsibilities

Own HTTP boundaries, health/version endpoints, request validation, response shaping, schema models,
configuration loading, logging, and backend service composition.

## Constraints

Do not place domain rules, provider integrations, database-specific behavior, or browser automation
directly in the API layer. No routes beyond infrastructure health/version checks are allowed until
later approved phases.

Pydantic response and request models belong in `schema.py`, not inline in route modules.
