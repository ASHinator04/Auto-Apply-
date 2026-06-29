import {
  EmploymentType,
  JobType,
  ProviderType,
  WorkMode,
  type Job,
  type JobSearchInput,
} from "@job-agent/contracts";

import { SearchProviderRegistry } from "./registry";
import { SearchService } from "./service";
import { SearchLifecycleStage, type SearchProvider } from "./types";

const request: JobSearchInput = {
  userId: "user-1",
  query: "software engineer",
};

function createJob(id: string, providerId: string): Job {
  return {
    id,
    providerId,
    providerType: ProviderType.Other,
    externalId: `external-${id}`,
    sourceUrl: "about:blank",
    title: "Software Engineer",
    companyName: "Example Company",
    location: {
      remote: true,
    },
    jobType: JobType.FullTime,
    employmentType: EmploymentType.Permanent,
    workMode: WorkMode.Remote,
    discoveredAt: "2026-01-01T00:00:00.000Z",
  };
}

function createProvider(
  id: string,
  search: SearchProvider["search"] = async () => ({ jobs: [createJob(`job-${id}`, id)] }),
): SearchProvider {
  return {
    id,
    type: ProviderType.Other,
    name: id,
    search,
  };
}

describe("search service", () => {
  it("returns an empty completed result when no providers are registered", async () => {
    const service = new SearchService({
      clock: () => "2026-01-01T00:00:00.000Z",
      idGenerator: (prefix) => `${prefix}-1`,
    });

    const execution = await service.searchWithDiagnostics(request);

    expect(execution.result.jobs).toEqual([]);
    expect(execution.result.totalFound).toBe(0);
    expect(execution.result.requestId).toBe("search-request-1");
    expect(execution.providerExecutions).toEqual([]);
    expect(execution.lifecycle.map((event) => event.stage)).toEqual([
      SearchLifecycleStage.Created,
      SearchLifecycleStage.ProviderSelection,
      SearchLifecycleStage.ProviderExecution,
      SearchLifecycleStage.ResultCollection,
      SearchLifecycleStage.Completed,
    ]);
  });

  it("executes selected providers independently and aggregates successful jobs", async () => {
    const registry = new SearchProviderRegistry([
      createProvider("provider-a"),
      createProvider("provider-b"),
    ]);
    const service = new SearchService({
      registry,
      configuration: {
        providerPriorities: {
          "provider-a": 1,
          "provider-b": 2,
        },
      },
      clock: () => "2026-01-01T00:00:00.000Z",
      idGenerator: (prefix) => `${prefix}-1`,
    });

    const execution = await service.searchWithDiagnostics(request);

    expect(execution.result.totalFound).toBe(2);
    expect(execution.result.jobs.map((job) => job.providerId)).toEqual([
      "provider-a",
      "provider-b",
    ]);
    expect(execution.providerExecutions.map((result) => result.status)).toEqual([
      "succeeded",
      "succeeded",
    ]);
  });

  it("keeps successful provider results when another provider fails", async () => {
    const registry = new SearchProviderRegistry([
      createProvider("provider-a"),
      createProvider("provider-b", async () => {
        throw new Error("Provider unavailable.");
      }),
    ]);
    const service = new SearchService({ registry });

    const execution = await service.searchWithDiagnostics(request);

    expect(execution.result.jobs).toHaveLength(1);
    expect(execution.providerExecutions.map((result) => result.status)).toEqual([
      "succeeded",
      "failed",
    ]);
  });

  it("marks provider execution as timed out when it exceeds configuration", async () => {
    const registry = new SearchProviderRegistry([
      createProvider(
        "provider-a",
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ jobs: [] }), 50);
          }),
      ),
    ]);
    const service = new SearchService({
      registry,
      configuration: {
        timeoutMs: 1,
      },
    });

    const execution = await service.searchWithDiagnostics(request);

    expect(execution.providerExecutions[0]?.status).toBe("timed_out");
    expect(execution.result.jobs).toEqual([]);
  });

  it("implements the contract search interface by returning only the unified result", async () => {
    const registry = new SearchProviderRegistry([createProvider("provider-a")]);
    const service = new SearchService({ registry });

    await expect(service.search(request)).resolves.toMatchObject({
      totalFound: 1,
    });
  });

  it("measures provider duration through an injected clock", async () => {
    const registry = new SearchProviderRegistry([createProvider("provider-a")]);
    const durationValues = [100, 125];
    const service = new SearchService({
      registry,
      durationClock: () => durationValues.shift() ?? 125,
    });

    const execution = await service.searchWithDiagnostics(request);

    expect(execution.providerExecutions[0]?.durationMs).toBe(25);
  });
});
