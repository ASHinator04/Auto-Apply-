import { ProviderType } from "@job-agent/contracts";

import { aggregateProviderResults } from "./aggregation";

describe("search result aggregation", () => {
  it("collects provider result collections without transforming raw jobs", () => {
    const greenhouseJob = { id: 1 };
    const leverJob = { id: "lever-1" };

    const result = aggregateProviderResults([
      {
        providerId: "greenhouse:acme",
        providerType: ProviderType.Greenhouse,
        providerName: "Acme",
        jobs: [greenhouseJob],
      },
      {
        providerId: "lever:acme",
        providerType: ProviderType.Lever,
        providerName: "Acme",
        providerPriority: 10,
        jobs: [leverJob],
      },
    ]);

    expect(result).toEqual([
      expect.objectContaining({
        providerId: "greenhouse:acme",
        providerType: ProviderType.Greenhouse,
        providerPriority: 1_000,
        collectionIndex: 0,
        jobIndex: 0,
        rawJob: greenhouseJob,
      }),
      expect.objectContaining({
        providerId: "lever:acme",
        providerType: ProviderType.Lever,
        providerPriority: 10,
        collectionIndex: 1,
        jobIndex: 0,
        rawJob: leverJob,
      }),
    ]);
  });
});
