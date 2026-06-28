# services/api AGENTS

## Purpose

`services/api/` contains the FastAPI backend service.

## Responsibilities

Own HTTP boundaries, health/version endpoints, resume management endpoints, request validation,
response shaping, schema models, configuration loading, logging, and backend service composition.

## Constraints

Do not place provider integrations, browser automation, job search, AI behavior, or future phase
logic directly in the API layer. Resume persistence may use the approved local SQLite metadata
repository; broader storage concerns should stay behind repository boundaries.

Pydantic response and request models belong in `schema.py`, not inline in route modules.
