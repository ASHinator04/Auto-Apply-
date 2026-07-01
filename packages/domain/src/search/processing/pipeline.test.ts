import { ProviderType, WorkMode } from "@job-agent/contracts";

import { SearchResultProcessingPipeline } from "./pipeline";
import type { RawProviderResultCollection } from "./types";

describe("search result processing pipeline", () => {
  it("returns one canonical ranked job from duplicate Greenhouse, Lever, and Ashby results", () => {
    const durationValues = [0, 1, 1, 3, 3, 5, 5, 8, 8, 10, 10, 13, 13, 14];
    const pipeline = new SearchResultProcessingPipeline({
      clock: () => "2026-07-01T00:00:00.000Z",
      durationClock: () => durationValues.shift() ?? 14,
    });

    const response = pipeline.process({
      request: {
        userId: "user-1",
        query: "backend engineer",
        workModes: [WorkMode.Remote],
      },
      providerResults: createDuplicateProviderResults(),
    });

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0]).toMatchObject({
      providerType: ProviderType.Greenhouse,
      title: "Backend Engineer",
      companyName: "Acme",
      sourceUrl: "https://jobs.example.com/backend",
    });
    expect(response.processing).toMatchObject({
      rawCount: 4,
      aggregatedCount: 4,
      normalizedCount: 4,
      validCount: 3,
      deduplicatedCount: 1,
      qualityFilteredCount: 1,
      returnedCount: 1,
      validationErrorCount: 1,
      duplicateCount: 2,
    });
    expect(response.providerStatistics).toEqual([
      expect.objectContaining({ providerId: "greenhouse:acme", rawCount: 1, returnedCount: 1 }),
      expect.objectContaining({ providerId: "lever:acme", rawCount: 2, returnedCount: 0 }),
      expect.objectContaining({ providerId: "ashby:acme", rawCount: 1, returnedCount: 0 }),
    ]);
    expect(response.validation.errors[0]?.code).toBe("invalid_url");
    expect(response.processing.stageTimings.map((timing) => timing.stage)).toEqual([
      "aggregation",
      "normalization",
      "validation",
      "deduplication",
      "quality_filtering",
      "ranking",
      "response",
    ]);
  });
});

function createDuplicateProviderResults(): RawProviderResultCollection[] {
  return [
    {
      providerId: "greenhouse:acme",
      providerType: ProviderType.Greenhouse,
      providerName: "Acme",
      providerPriority: 100,
      durationMs: 20,
      jobs: [
        {
          id: 123,
          title: "Backend Engineer",
          absoluteUrl: "https://jobs.example.com/backend",
          location: { name: "Remote" },
          departments: [{ name: "Engineering" }],
          offices: [],
          content: "Build backend services.",
          updatedAt: "2026-06-25T00:00:00.000Z",
          providerMetadata: { provider: "greenhouse", boardToken: "acme" },
          raw: {},
        },
      ],
    },
    {
      providerId: "lever:acme",
      providerType: ProviderType.Lever,
      providerName: "Acme",
      providerPriority: 200,
      durationMs: 25,
      jobs: [
        {
          id: "posting-1",
          title: "Backend Engineer",
          categories: {
            location: "Remote",
            team: "Platform",
            department: "Engineering",
            commitment: "Full-time",
            allLocations: ["Remote"],
          },
          hostedUrl: "https://jobs.example.com/backend",
          descriptionPlain: "Build backend services.",
          workplaceType: "remote",
          providerMetadata: { provider: "lever", site: "acme" },
          raw: {},
        },
        {
          id: "invalid",
          title: "Broken Job",
          categories: { allLocations: ["Remote"] },
          hostedUrl: "not-a-url",
          providerMetadata: { provider: "lever", site: "acme" },
          raw: {},
        },
      ],
    },
    {
      providerId: "ashby:acme",
      providerType: ProviderType.Ashby,
      providerName: "Acme",
      providerPriority: 300,
      durationMs: 15,
      jobs: [
        {
          title: "Backend Engineer",
          location: "Remote",
          secondaryLocations: [],
          isRemote: true,
          jobUrl: "https://jobs.example.com/backend",
          descriptionPlain: "Build backend services.",
          providerMetadata: { provider: "ashby", jobBoardName: "acme" },
          raw: {},
        },
      ],
    },
  ];
}
