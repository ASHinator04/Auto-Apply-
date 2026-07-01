import type { JobSearchInput } from "@job-agent/contracts";
import { SearchService, type UnifiedSearchResponse } from "@job-agent/domain";

import type { SearchApiPayload } from "./search-types";

export interface UnifiedSearchExecutor {
  searchUnified(request: JobSearchInput): Promise<UnifiedSearchResponse>;
}

const LOCAL_USER_ID = "local-user";

export async function executeSearchExperience(
  payload: SearchApiPayload,
  executor: UnifiedSearchExecutor = new SearchService(),
): Promise<UnifiedSearchResponse> {
  const request = toJobSearchInput(payload);
  return executor.searchUnified(request);
}

export function toJobSearchInput(payload: SearchApiPayload): JobSearchInput {
  const query = typeof payload.query === "string" ? payload.query.trim() : "";
  if (!query) {
    throw new SearchExperienceValidationError("Search keywords are required.");
  }

  return {
    userId: LOCAL_USER_ID,
    query,
    locations: cleanList(payload.locations),
    workModes: payload.workModes,
  };
}

export class SearchExperienceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SearchExperienceValidationError";
  }
}

function cleanList(values: readonly string[] | undefined): string[] | undefined {
  if (!values) {
    return undefined;
  }

  const cleaned = values.map((value) => value.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : undefined;
}
