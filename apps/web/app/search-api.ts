import { recordActivity } from "./activity-log-store";
import type { SearchExecutionRequest, SearchExperienceResponse } from "./search-types";
import { toSearchApiPayload } from "./search-utils";

const UNEXPECTED_SEARCH_RESPONSE = "Search returned an unexpected response.";

export async function executeSearch(
  request: SearchExecutionRequest,
): Promise<SearchExperienceResponse> {
  recordActivity({
    area: "search",
    level: "info",
    message: "Executing search.",
    detail: request.keywords,
  });

  const response = await fetch("/api/search", {
    body: JSON.stringify(toSearchApiPayload(request)),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const payload = await parseResponse(response);
  if (!isSearchExperienceResponse(payload)) {
    recordActivity({
      area: "search",
      level: "error",
      message: "Search request failed.",
      detail: UNEXPECTED_SEARCH_RESPONSE,
    });
    throw new Error(UNEXPECTED_SEARCH_RESPONSE);
  }

  recordActivity({
    area: "search",
    level: "success",
    message: "Unified search response received.",
    detail: `${payload.jobs.length.toString()} jobs returned.`,
  });

  return payload;
}

async function parseResponse(response: Response): Promise<unknown> {
  const payload = await parsePayload(response);
  if (!response.ok) {
    const message = errorDetail(payload);
    recordActivity({
      area: "search",
      level: "error",
      message: "Search request failed.",
      detail: message,
    });
    throw new Error(message);
  }
  return payload;
}

async function parsePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

function errorDetail(payload: unknown): string {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (isDetailPayload(payload) && typeof payload.detail === "string") {
    return payload.detail;
  }

  return "Search request failed.";
}

function isDetailPayload(payload: unknown): payload is { detail: unknown } {
  return typeof payload === "object" && payload !== null && "detail" in payload;
}

function isSearchExperienceResponse(payload: unknown): payload is SearchExperienceResponse {
  if (!isRecord(payload)) {
    return false;
  }

  const validation = payload.validation;
  const deduplication = payload.deduplication;

  return (
    isRecord(payload.request) &&
    Array.isArray(payload.jobs) &&
    Array.isArray(payload.rankedJobs) &&
    Array.isArray(payload.providerStatistics) &&
    isRecord(payload.processing) &&
    isRecord(validation) &&
    Array.isArray(validation.errors) &&
    isRecord(deduplication) &&
    Array.isArray(deduplication.removed) &&
    typeof payload.createdAt === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
