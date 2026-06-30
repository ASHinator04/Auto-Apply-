# Greenhouse Provider Spec

## Status

Phase 3.3 complete.

## Objective

Search public Greenhouse job boards through the provider plugin framework and return raw Greenhouse
job objects.

## Supported Inputs

- Board token.
- Keyword query.
- Location filters where raw location or office fields are present.
- Remote preference where raw location or office fields indicate remote work.
- Department filters where raw department fields are present.

Unsupported filters are ignored gracefully.

## Raw Job Fields

The connector parses available values only:

- id
- internal job id
- title
- absolute URL
- location
- departments
- offices
- updated date
- requisition id
- content
- metadata
- provider metadata
- raw payload

## Non-Goals

- Lever.
- Ashby.
- Browser automation.
- HTML parsing.
- Normalization.
- Deduplication.
- Ranking.
- Caching.
- Storage.
- Dashboard or search UI.

## Verification

Automated tests must mock HTTP behavior and cover configuration, request building, parsing,
filtering, retry handling, pagination, connector orchestration, plugin registration, and raw result
handoff.
