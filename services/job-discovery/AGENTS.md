# services/job-discovery AGENTS

## Purpose

`services/job-discovery/` will contain future orchestration for scheduled or user-triggered job
discovery.

## Responsibilities

Coordinate provider adapters, discovery criteria, normalization, and result handoff to persistence.

## Constraints

Do not own provider scraping details or domain rules. Keep discovery runs auditable and resumable.
