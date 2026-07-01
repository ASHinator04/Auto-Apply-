# Search Deduplication

## Strategy

Deduplication is exact and deterministic. It uses these keys:

1. Provider type plus provider job id.
2. Canonical source URL.
3. Company, title, and primary location.

No fuzzy matching, semantic similarity, AI, embeddings, or machine learning are used.

## Tie-Breaking

When multiple jobs match the same duplicate group, the pipeline keeps one job using:

1. Provider precedence: Greenhouse, then Lever, then Ashby, then Other.
2. Completeness score: description, department, team, employment type, compensation, and posted
   date.
3. Stable canonical job id.

Removed duplicates are returned as structured `DeduplicationDecision` records with the duplicate id,
kept id, and matching reason.

## Limits

The strategy intentionally avoids fuzzy matching. Near-duplicates with different titles, companies,
URLs, and locations can remain until a later approved phase adds more advanced matching.
