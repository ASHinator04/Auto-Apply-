# Ashby Provider

## Purpose

The Ashby provider searches one public Ashby job board and returns raw Ashby posting objects through
the provider plugin framework.

## Public API

Ashby's public postings API exposes currently published postings for a job board:

```text
GET https://api.ashbyhq.com/posting-api/job-board/{JOB_BOARD_NAME}?includeCompensation=true
```

Reference: [Ashby Job Postings API](https://developers.ashbyhq.com/docs/public-job-posting-api).

The job board name is the final path segment of an Ashby-hosted board such as
`https://jobs.ashbyhq.com/{JOB_BOARD_NAME}`.

## Implementation

Provider code lives in `packages/providers/src/ashby` and follows the canonical guide in
`specs/providers/PROVIDER_IMPLEMENTATION_GUIDE.md`.

The connector owns:

- Ashby-specific configuration and validation.
- Public postings URL construction.
- JSON fetching through shared provider HTTP infrastructure.
- Raw Ashby response parsing.
- Local filtering over raw Ashby fields.
- Plugin metadata, registration, discovery, and raw result handoff.

## Intentional Differences

Ashby's public postings endpoint returns one board-wide JSON payload rather than paginated pages.
The connector reports `pagesFetched: 1` for consistency with the raw provider result shape.

Compensation is optional on the public API and controlled through the `includeCompensation`
configuration flag.

## Non-Goals

This provider does not normalize jobs, deduplicate, rank, cache, store results, add dashboard UI, or
automate applications.
