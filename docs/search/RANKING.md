# Search Ranking

## Strategy

Ranking is deterministic and replaceable. It scores only available canonical job fields:

- Keyword relevance.
- Posting recency.
- Provider priority.

No AI, embeddings, semantic search, or machine learning are used.

## Signals

Keyword relevance checks query tokens against title, company, description, and location. Title
matches carry the highest weight.

Recency gives small deterministic boosts to jobs posted within 7, 30, and 90 days of the processing
clock.

Provider priority uses configured provider priority values. Lower provider priority values produce
larger ranking boosts.

## Tie-Breaking

Jobs with equal scores are sorted by posted date, then by company, title, and URL. This keeps output
stable across repeated runs.
