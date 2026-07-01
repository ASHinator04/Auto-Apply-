import { ProviderType, WorkMode } from "@job-agent/contracts";

import { filterLowQualityJobs } from "./quality-filter";
import type { CanonicalJob } from "./types";
import { validateCanonicalJobs } from "./validation";

describe("search result validation and quality filtering", () => {
  it("excludes invalid canonical jobs with structured errors", () => {
    const result = validateCanonicalJobs([
      createJob({ title: "", sourceUrl: "not-a-url", providerJobId: "" }),
    ]);

    expect(result.validJobs).toEqual([]);
    expect(result.errors.map((error) => error.code)).toEqual([
      "missing_title",
      "missing_identifier",
      "invalid_url",
    ]);
  });

  it("removes low-quality jobs conservatively", () => {
    const result = filterLowQualityJobs([
      createJob({
        companyName: "",
        locations: [],
      }),
    ]);

    expect(result.jobs).toEqual([]);
    expect(result.errors.map((error) => error.code)).toEqual([
      "missing_company",
      "missing_location",
    ]);
  });
});

function createJob(overrides: Partial<CanonicalJob> = {}): CanonicalJob {
  return {
    id: "greenhouse:123",
    providerId: "greenhouse:acme",
    providerType: ProviderType.Greenhouse,
    providerJobId: "123",
    sourceUrl: "https://jobs.example.com/backend",
    title: "Backend Engineer",
    companyName: "Acme",
    locations: [{ label: "Remote", remote: true }],
    workMode: WorkMode.Remote,
    discoveredAt: "2026-01-01T00:00:00.000Z",
    metadata: {
      providerId: "greenhouse:acme",
      providerType: ProviderType.Greenhouse,
      providerName: "Acme",
      sourceFields: {},
    },
    ...overrides,
  };
}
