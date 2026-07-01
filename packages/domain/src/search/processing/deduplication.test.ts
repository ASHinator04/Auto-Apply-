import { ProviderType, WorkMode } from "@job-agent/contracts";

import { deduplicateJobs } from "./deduplication";
import type { CanonicalJob } from "./types";

describe("search result deduplication", () => {
  it("keeps one deterministic canonical job across exact cross-provider duplicates", () => {
    const result = deduplicateJobs([
      createJob({
        id: "lever:posting-1",
        providerId: "lever:acme",
        providerType: ProviderType.Lever,
        providerJobId: "posting-1",
      }),
      createJob({
        id: "ashby:backend",
        providerId: "ashby:acme",
        providerType: ProviderType.Ashby,
        providerJobId: "backend",
      }),
      createJob({
        id: "greenhouse:123",
        providerId: "greenhouse:acme",
        providerType: ProviderType.Greenhouse,
        providerJobId: "123",
      }),
    ]);

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0]?.providerType).toBe(ProviderType.Greenhouse);
    expect(result.removed).toHaveLength(2);
  });

  it("uses provider id plus external id to catch same-provider duplicates", () => {
    const result = deduplicateJobs([
      createJob({ id: "lever:a", providerJobId: "same", sourceUrl: "https://jobs.example.com/a" }),
      createJob({ id: "lever:b", providerJobId: "same", sourceUrl: "https://jobs.example.com/b" }),
    ]);

    expect(result.jobs).toHaveLength(1);
    expect(result.removed[0]).toMatchObject({
      duplicateJobId: "lever:b",
      keptJobId: "lever:a",
    });
  });
});

function createJob(overrides: Partial<CanonicalJob> = {}): CanonicalJob {
  const providerType = overrides.providerType ?? ProviderType.Lever;
  const providerId = overrides.providerId ?? "lever:acme";

  return {
    id: "lever:posting-1",
    providerId,
    providerType,
    providerJobId: "posting-1",
    sourceUrl: "https://jobs.example.com/backend",
    title: "Backend Engineer",
    companyName: "Acme",
    locations: [{ label: "Remote", remote: true }],
    workMode: WorkMode.Remote,
    discoveredAt: "2026-01-01T00:00:00.000Z",
    metadata: {
      providerId,
      providerType,
      providerName: "Acme",
      sourceFields: {},
    },
    ...overrides,
  };
}
