import { WorkMode, type JobSearchInput } from "@job-agent/contracts";
import type { UnifiedSearchResponse } from "@job-agent/domain";
import { describe, expect, it } from "vitest";

import {
  executeSearchExperience,
  SearchExperienceValidationError,
  toJobSearchInput,
  type UnifiedSearchExecutor,
} from "./search-execution";

describe("search execution", () => {
  it("creates a search engine request from the route payload", () => {
    expect(
      toJobSearchInput({
        query: " backend engineer ",
        locations: [" Remote "],
        workModes: [WorkMode.Remote],
      }),
    ).toEqual({
      userId: "local-user",
      query: "backend engineer",
      locations: ["Remote"],
      workModes: [WorkMode.Remote],
    });
  });

  it("rejects empty keywords before calling the search engine", async () => {
    const executor = createExecutor();

    await expect(executeSearchExperience({ query: " " }, executor)).rejects.toBeInstanceOf(
      SearchExperienceValidationError,
    );
    expect(executor.requests).toEqual([]);
  });

  it("rejects malformed route payloads before calling the search engine", async () => {
    const executor = createExecutor();

    await expect(
      executeSearchExperience({} as Parameters<typeof executeSearchExperience>[0], executor),
    ).rejects.toBeInstanceOf(SearchExperienceValidationError);
    expect(executor.requests).toEqual([]);
  });

  it("executes through the unified search boundary", async () => {
    const executor = createExecutor();

    const response = await executeSearchExperience({ query: "software" }, executor);

    expect(executor.requests).toEqual([
      {
        userId: "local-user",
        query: "software",
        locations: undefined,
        workModes: undefined,
      },
    ]);
    expect(response.jobs).toEqual([]);
    expect(response.processing.returnedCount).toBe(0);
  });
});

function createExecutor(): UnifiedSearchExecutor & { requests: JobSearchInput[] } {
  const requests: JobSearchInput[] = [];

  return {
    requests,
    async searchUnified(request) {
      requests.push(request);
      return createEmptyResponse(request);
    },
  };
}

function createEmptyResponse(request: JobSearchInput): UnifiedSearchResponse {
  return {
    request,
    jobs: [],
    rankedJobs: [],
    providerStatistics: [],
    processing: {
      rawCount: 0,
      aggregatedCount: 0,
      normalizedCount: 0,
      validCount: 0,
      deduplicatedCount: 0,
      qualityFilteredCount: 0,
      returnedCount: 0,
      validationErrorCount: 0,
      duplicateCount: 0,
      stageTimings: [],
    },
    validation: { errors: [] },
    deduplication: { removed: [] },
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}
