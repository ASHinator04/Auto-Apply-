# Search Result Processing Pipeline

## Purpose

The Phase 3.6 pipeline converts raw provider results into one deterministic unified search response.
It is stateless and does not persist results.

Phase 3.7 certifies `SearchService.searchUnified(request)` as the end-to-end entrypoint that
executes ready providers, collects raw provider results, runs this pipeline, and returns
`UnifiedSearchResponse`.

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

## Certified Entry Point

Future phases should call `SearchService.searchUnified` from the API or UI integration layer and
consume `UnifiedSearchResponse`. Persistence, dashboard views, saved searches, application queues,
AI ranking, and semantic retrieval are not part of this pipeline.

## Certification Guarantees

- Stages are pure, stateless functions or a stateless orchestration class.
- Provider raw objects do not leave normalization.
- Invalid canonical jobs return structured validation errors.
- Corrupt provider metadata is rejected before deduplication.
- Future consumers should depend on `UnifiedSearchResponse`, not provider raw models.
