import { WorkMode, type JobSearchInput } from "@job-agent/contracts";
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
    locations: cleanStringList(payload.locations, "locations"),
    workModes: cleanWorkModes(payload.workModes),
  };
}

export class SearchExperienceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SearchExperienceValidationError";
  }
}

function cleanStringList(values: unknown, fieldName: string): string[] | undefined {
  if (!values) {
    return undefined;
  }

  if (!Array.isArray(values)) {
    throw new SearchExperienceValidationError(`${fieldName} must be an array.`);
  }

  if (values.some((value) => typeof value !== "string")) {
    throw new SearchExperienceValidationError(`${fieldName} must contain only strings.`);
  }

  const strings = values as string[];
  const cleaned = strings.map((value) => value.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : undefined;
}

function cleanWorkModes(values: unknown): WorkMode[] | undefined {
  if (!values) {
    return undefined;
  }

  if (!Array.isArray(values)) {
    throw new SearchExperienceValidationError("workModes must be an array.");
  }

  const allowedModes = new Set(Object.values(WorkMode));
  const cleanedModes = values.filter((value): value is WorkMode => {
    return typeof value === "string" && allowedModes.has(value as WorkMode);
  });

  if (cleanedModes.length !== values.length) {
    throw new SearchExperienceValidationError("workModes contains an unsupported value.");
  }

  return cleanedModes.length > 0 ? cleanedModes : undefined;
}
