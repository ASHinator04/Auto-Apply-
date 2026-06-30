# Greenhouse Provider

## Purpose

The Greenhouse connector searches public Greenhouse job boards and returns raw Greenhouse job
objects. It is the Phase 3.3 reference provider plugin.

## Search Flow

1. Build `GET /boards/{boardToken}/jobs?content=true`.
2. Fetch JSON using the configured timeout, User-Agent, and retry policy.
3. Follow `Link: rel="next"` pagination up to `maxPages`.
4. Parse available job fields only.
5. Apply supported local filters for keyword, location, remote preference, and department.
6. Return `RawGreenhouseJob[]`.

## Request Format

Base URL defaults to `https://boards-api.greenhouse.io/v1`. A board token is required.

Example:

```text
https://boards-api.greenhouse.io/v1/boards/{boardToken}/jobs?content=true
```

## Response Structure

Parsed fields include id, internal job id, title, absolute URL, location, departments, offices,
updated date, requisition id, content, metadata, provider metadata, and the raw payload.

## Limitations

- No authentication support is included because public board reads do not require it.
- No normalization, deduplication, ranking, caching, storage, or dashboard integration exists.
- Unsupported filters are ignored or handled locally when raw fields are available.
- Tests mock all HTTP behavior.

## Extension Points

Future providers should copy the same separation: configuration, HTTP client, request builder,
parser, connector, plugin, and registration.

Reference: official Greenhouse Job Board API documentation at
`https://developers.greenhouse.io/job-board.html`.
