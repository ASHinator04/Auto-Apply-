# Ashby Provider Spec

## Status

Phase 3.5 complete.

## Objective

Search public Ashby job boards through the provider plugin framework and return raw Ashby posting
objects.

## Supported Inputs

- Job board name.
- Keyword query, applied locally because the public postings endpoint returns board-wide JSON.
- Location filters where raw primary, secondary, or postal address fields are present.
- Remote preference where `isRemote`, workplace type, or location fields indicate remote work.
- Team, department, and employment type filters where raw fields are present.
- Optional compensation inclusion through `includeCompensation`.

Unsupported filters are ignored gracefully.

## Raw Job Fields

The connector parses available values only:

- title
- primary location
- secondary locations
- department
- team
- listed flag
- remote flag
- workplace type
- HTML and plain-text descriptions
- published date
- employment type
- postal address
- job URL
- apply URL
- compensation summaries, tiers, and components
- provider metadata
- raw payload

## Non-Goals

- Aggregation.
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
filtering, retry handling, invalid response handling, timeout classification, connector
orchestration, plugin registration, discovery, and raw result handoff.
