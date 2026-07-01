# Search Result Processing Pipeline

## Purpose

The Phase 3.6 pipeline converts raw provider results into one deterministic unified search response.
It is stateless and does not persist results.

## Flow

```text
Provider raw results
  -> Aggregation
  -> Normalization
  -> Validation
  -> Deduplication
  -> Quality filtering
  -> Ranking
  -> Unified response
```

## Stages

| Stage             | Input                       | Output                               | Responsibility                                                                         |
| ----------------- | --------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------- |
| Aggregation       | Provider result collections | Aggregated raw entries               | Collect raw jobs without transformation                                                |
| Normalization     | Aggregated raw entries      | Canonical jobs                       | Convert provider vocabulary into the canonical model                                   |
| Validation        | Canonical jobs              | Valid jobs plus structured errors    | Exclude structurally invalid jobs                                                      |
| Deduplication     | Valid jobs                  | Unique canonical jobs plus decisions | Remove exact deterministic duplicates                                                  |
| Quality filtering | Unique jobs                 | Minimum-quality jobs plus errors     | Remove incomplete jobs conservatively                                                  |
| Ranking           | Quality jobs                | Ranked jobs                          | Sort deterministically using replaceable scoring                                       |
| Response          | Ranked jobs and stats       | Unified response                     | Return jobs, provider stats, processing stats, timings, validation, and dedupe summary |

## Extension Points

Future phases may call this pipeline from the search service or API layer. Persistence, dashboard
views, saved searches, application queues, AI ranking, and semantic retrieval are not part of this
pipeline.
