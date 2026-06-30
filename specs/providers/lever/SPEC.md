# Lever Provider Spec

## Status

Phase 3.4 complete.

## Objective

Search public Lever postings through the provider plugin framework and return raw Lever posting
objects.

## Supported Inputs

- Site name.
- Keyword query, applied locally because Lever does not provide full-text search.
- Location filters, passed to Lever when provided.
- Team filters, passed to Lever when provided.
- Department filters, passed to Lever when provided.
- Commitment filters, passed to Lever when provided.
- Remote preference, applied locally where workplace type or location fields indicate remote work.

Unsupported filters are ignored gracefully.

## Raw Job Fields

The connector parses available values only:

- id
- title
- categories
- country
- workplace type
- hosted URL
- apply URL
- opening and description fields
- lists
- additional content
- salary range
- salary description
- provider metadata
- raw payload

## Non-Goals

- Ashby.
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
filtering, retry handling, invalid response handling, timeout classification, skip/limit pagination,
connector orchestration, plugin registration, and raw result handoff.
