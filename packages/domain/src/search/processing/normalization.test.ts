import { ProviderType, WorkMode } from "@job-agent/contracts";

import { aggregateProviderResults } from "./aggregation";
import { normalizeAggregatedJobs } from "./normalization";
import type { RawProviderResultCollection } from "./types";

describe("search result normalization", () => {
  it("normalizes Greenhouse raw jobs into canonical jobs", () => {
    const jobs = normalizeAggregatedJobs(
      aggregateProviderResults([
        {
          providerId: "greenhouse:acme",
          providerType: ProviderType.Greenhouse,
          providerName: "Acme",
          jobs: [
            {
              id: 123,
              title: "Backend Engineer",
              absoluteUrl: "https://jobs.example.com/backend",
              location: { name: "Remote" },
              departments: [{ name: "Engineering" }],
              offices: [],
              content: "Build systems.",
              providerMetadata: { provider: "greenhouse", boardToken: "acme" },
              raw: {},
            },
          ],
        },
      ]),
      { discoveredAt: "2026-01-01T00:00:00.000Z" },
    );

    expect(jobs[0]).toMatchObject({
      providerType: ProviderType.Greenhouse,
      providerJobId: "123",
      title: "Backend Engineer",
      companyName: "Acme",
      sourceUrl: "https://jobs.example.com/backend",
      workMode: WorkMode.Remote,
      department: "Engineering",
      metadata: {
        sourceBoard: "acme",
      },
    });
  });

  it("normalizes Lever and Ashby raw jobs without provider imports", () => {
    const collections: RawProviderResultCollection[] = [
      {
        providerId: "lever:acme",
        providerType: ProviderType.Lever,
        providerName: "Acme",
        jobs: [
          {
            id: "posting-1",
            title: "Platform Engineer",
            categories: {
              location: "New York",
              team: "Platform",
              department: "Engineering",
              commitment: "Full-time",
              allLocations: ["New York"],
            },
            hostedUrl: "https://jobs.example.com/platform",
            workplaceType: "hybrid",
            providerMetadata: { provider: "lever", site: "acme" },
            raw: {},
          },
        ],
      },
      {
        providerId: "ashby:acme",
        providerType: ProviderType.Ashby,
        providerName: "Acme",
        jobs: [
          {
            title: "Product Engineer",
            location: "Remote",
            secondaryLocations: [],
            isRemote: true,
            jobUrl: "https://jobs.example.com/product",
            providerMetadata: { provider: "ashby", jobBoardName: "acme" },
            raw: {},
          },
        ],
      },
    ];

    const jobs = normalizeAggregatedJobs(aggregateProviderResults(collections), {
      discoveredAt: "2026-01-01T00:00:00.000Z",
    });

    expect(jobs.map((job) => job.providerType)).toEqual([ProviderType.Lever, ProviderType.Ashby]);
    expect(jobs[0]).toMatchObject({
      team: "Platform",
      department: "Engineering",
      employmentType: "Full-time",
    });
    expect(jobs[1]).toMatchObject({
      workMode: WorkMode.Remote,
      metadata: {
        sourceBoard: "acme",
      },
    });
  });
});
