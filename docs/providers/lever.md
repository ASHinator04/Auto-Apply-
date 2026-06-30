# Lever Provider

## Purpose

The Lever connector searches public Lever postings and returns raw Lever posting objects. It is the
Phase 3.4 provider plugin and follows the Greenhouse connector structure.

## Search Flow

1. Build `GET /v0/postings/{site}?mode=json&skip={skip}&limit={limit}`.
2. Add supported provider-side filters for location, team, department, and commitment.
3. Fetch JSON using the configured timeout, User-Agent, and retry policy.
4. Continue skip/limit pagination until a short page is returned or `maxPages` is reached.
5. Parse available posting fields only.
6. Apply local filters for keyword and remote preference where raw fields allow it.
7. Return `RawLeverJob[]`.

## Request Format

Base URL defaults to `https://api.lever.co/v0/postings`. A Lever site name is required.

Example:

```text
https://api.lever.co/v0/postings/{site}?mode=json&skip=0&limit=100
```

## Response Structure

Parsed fields include id, title, categories, country, workplace type, hosted URL, apply URL,
description fields, posting lists, additional content, salary fields, provider metadata, and a
shallow snapshot of the raw top-level payload.

## Differences from Greenhouse

- Lever pagination uses `skip` and `limit` instead of `Link: rel="next"`.
- Lever list responses are JSON arrays instead of an object containing `jobs`.
- Lever supports provider-side filters for location, team, department, and commitment.
- Lever does not provide full-text search, so keyword filtering is local.

## Error Handling

Transient HTTP statuses can be retried according to connector configuration. Invalid JSON is
reported as `invalid_response` without retrying, rate limits are reported as `rate_limited`, and
abort-style failures are reported as `timeout`.

## Limitations

- No authentication support is included because public postings do not require it.
- No Ashby, aggregation, normalization, deduplication, ranking, caching, storage, or dashboard
  integration exists.
- Unsupported filters are ignored or handled locally when raw fields are available.
- Tests mock all HTTP behavior.

## Extension Points

Future providers should keep the same separation: configuration, HTTP client, request builder,
parser, connector, plugin, and registration.

Reference: official Lever Postings API documentation at `https://github.com/lever/postings-api`.
