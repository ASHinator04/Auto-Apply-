# Search Normalization

## Canonical Job Model

`CanonicalJob` lives in `packages/domain/src/search/processing/types.ts`. It represents common
cross-provider job data only:

- provider identity
- provider job id
- source URL
- title
- company name
- description
- locations
- work mode
- department and team when available
- employment type when available
- compensation summary when available
- posting and discovery timestamps
- dedicated provider metadata

Provider-specific raw models are consumed only by normalization and do not leave the stage.

## Provider Mapping

| Provider   | Identifier                           | URL                          | Company                  | Location                                      | Notes                                                         |
| ---------- | ------------------------------------ | ---------------------------- | ------------------------ | --------------------------------------------- | ------------------------------------------------------------- |
| Greenhouse | `id`, then `internalJobId`, then URL | `absoluteUrl`                | Provider collection name | `location` and `offices`                      | `updatedAt` is carried as provider posting timestamp          |
| Lever      | `id`                                 | `hostedUrl`, then `applyUrl` | Provider collection name | `categories.location` and `allLocations`      | salary range maps to canonical compensation                   |
| Ashby      | URL, then title fallback             | `jobUrl`, then `applyUrl`    | Provider collection name | primary, secondary, and postal address fields | compensation summary/components map to canonical compensation |

## Rules

- Do not infer unavailable values beyond deterministic field mapping.
- Keep provider-specific details under `metadata.sourceFields`.
- Keep raw provider objects out of the canonical response.
- Invalid or incomplete canonical jobs are handled by later validation and quality stages.
