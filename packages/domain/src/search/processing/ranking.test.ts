import { ProviderType, WorkMode } from "@job-agent/contracts";

import { rankJobs } from "./ranking";
import type { CanonicalJob } from "./types";

describe("search result ranking", () => {
  it("ranks deterministically by keyword, recency, and provider priority", () => {
    const providerPriorities = new Map([
      ["greenhouse:acme", 100],
      ["lever:acme", 900],
    ]);
    const ranked = rankJobs(
      [
        createJob({
          id: "lever:recruiter",
          providerId: "lever:acme",
          title: "Recruiter",
          description: "Hiring operations.",
          postedAt: "2025-01-01T00:00:00.000Z",
        }),
        createJob({
          id: "greenhouse:backend",
          providerId: "greenhouse:acme",
          title: "Backend Engineer",
          description: "Build backend services.",
          postedAt: "2026-06-25T00:00:00.000Z",
        }),
      ],
      {
        userId: "user-1",
        query: "backend engineer",
      },
      {
        now: "2026-07-01T00:00:00.000Z",
        providerPriorities,
      },
    );

    expect(ranked[0]?.job.id).toBe("greenhouse:backend");
    expect(ranked[0]?.signals.keyword).toBeGreaterThan(ranked[1]?.signals.keyword ?? 0);
  });
});

function createJob(overrides: Partial<CanonicalJob> = {}): CanonicalJob {
  return {
    id: "greenhouse:backend",
    providerId: "greenhouse:acme",
    providerType: ProviderType.Greenhouse,
    providerJobId: "backend",
    sourceUrl: "https://jobs.example.com/backend",
    title: "Backend Engineer",
    companyName: "Acme",
    locations: [{ label: "Remote", remote: true }],
    workMode: WorkMode.Remote,
    discoveredAt: "2026-07-01T00:00:00.000Z",
    metadata: {
      providerId: "greenhouse:acme",
      providerType: ProviderType.Greenhouse,
      providerName: "Acme",
      sourceFields: {},
    },
    ...overrides,
  };
}
