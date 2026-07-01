import { WorkMode, type JobSearchInput } from "@job-agent/contracts";
import type { UnifiedSearchResponse } from "@job-agent/domain";
import { afterEach, describe, expect, it, vi } from "vitest";

import { executeSearch } from "./search-api";

describe("search api client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns a valid unified search response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(createResponse())),
    );

    const response = await executeSearch({
      keywords: "software engineer",
      location: "Remote",
      remoteOnly: true,
      resumeId: "resume-1",
    });

    expect(response.jobs).toEqual([]);
    expect(fetch).toHaveBeenCalledWith(
      "/api/search",
      expect.objectContaining({
        body: JSON.stringify({
          query: "software engineer",
          locations: ["Remote"],
          workModes: [WorkMode.Remote],
        }),
        method: "POST",
      }),
    );
  });

  it("rejects unexpected successful response payloads", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ ok: true })),
    );

    await expect(
      executeSearch({
        keywords: "software engineer",
        remoteOnly: false,
      }),
    ).rejects.toThrow("Search returned an unexpected response.");
  });
});

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}

function createResponse(): UnifiedSearchResponse {
  const request: JobSearchInput = {
    userId: "local-user",
    query: "software engineer",
    locations: ["Remote"],
    workModes: [WorkMode.Remote],
  };

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
