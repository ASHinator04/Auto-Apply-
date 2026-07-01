import { ProviderPluginRegistry, SearchService } from "@job-agent/domain";

import type { AshbySearchConnector } from "./ashby/connector";
import { createAshbyProviderPlugin } from "./ashby/plugin";
import type { GreenhouseSearchConnector } from "./greenhouse/connector";
import { createGreenhouseProviderPlugin } from "./greenhouse/plugin";
import type { LeverSearchConnector } from "./lever/connector";
import { createLeverProviderPlugin } from "./lever/plugin";

const request = {
  userId: "user-1",
  query: "software engineer",
};

describe("search engine certification", () => {
  it("executes all provider plugins through the unified search pipeline", async () => {
    const pluginRegistry = new ProviderPluginRegistry([
      {
        plugin: createGreenhouseProviderPlugin(
          { boardToken: "acme" },
          { connector: createGreenhouseConnector() as unknown as GreenhouseSearchConnector },
        ),
        configuration: { priority: 1 },
      },
      {
        plugin: createLeverProviderPlugin(
          { site: "acme" },
          { connector: createLeverConnector() as unknown as LeverSearchConnector },
        ),
        configuration: { priority: 2 },
      },
      {
        plugin: createAshbyProviderPlugin(
          { jobBoardName: "acme" },
          { connector: createAshbyConnector() as unknown as AshbySearchConnector },
        ),
        configuration: { priority: 3 },
      },
    ]);
    await pluginRegistry.initializeAll();
    const service = new SearchService({
      registry: pluginRegistry.createSearchProviderRegistry(),
      configuration: pluginRegistry.createSearchConfigurationInput(),
      clock: () => "2026-01-01T00:00:00.000Z",
      idGenerator: (prefix) => `${prefix}-1`,
    });

    const response = await service.searchUnified(request);

    expect(response.jobs).toHaveLength(1);
    expect(response.jobs[0]?.providerId).toBe("greenhouse:acme");
    expect(response.processing).toMatchObject({
      rawCount: 3,
      normalizedCount: 3,
      validCount: 3,
      returnedCount: 1,
      duplicateCount: 2,
    });
    expect(response.providerStatistics.map((provider) => provider.status)).toEqual([
      "succeeded",
      "succeeded",
      "succeeded",
    ]);
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

  it("degrades gracefully with provider failure and invalid raw provider data", async () => {
    const pluginRegistry = new ProviderPluginRegistry([
      {
        plugin: createGreenhouseProviderPlugin(
          { boardToken: "acme" },
          { connector: createGreenhouseConnector() as unknown as GreenhouseSearchConnector },
        ),
      },
      {
        plugin: createLeverProviderPlugin(
          { site: "down" },
          { connector: createFailingLeverConnector() as unknown as LeverSearchConnector },
        ),
      },
      {
        plugin: createAshbyProviderPlugin(
          { jobBoardName: "invalid" },
          { connector: createInvalidAshbyConnector() as unknown as AshbySearchConnector },
        ),
      },
    ]);
    await pluginRegistry.initializeAll();
    const service = new SearchService({
      registry: pluginRegistry.createSearchProviderRegistry(),
      configuration: pluginRegistry.createSearchConfigurationInput(),
      clock: () => "2026-01-01T00:00:00.000Z",
    });

    const response = await service.searchUnified(request);
    const statuses = Object.fromEntries(
      response.providerStatistics.map((provider) => [provider.providerId, provider.status]),
    );

    expect(response.jobs).toHaveLength(1);
    expect(statuses).toMatchObject({
      "greenhouse:acme": "succeeded",
      "lever:down": "failed",
      "ashby:invalid": "succeeded",
    });
    expect(response.validation.errors.map((error) => error.code)).toEqual([
      "missing_title",
      "missing_identifier",
      "invalid_url",
    ]);
  });
});

function createGreenhouseConnector(): Pick<GreenhouseSearchConnector, "search"> {
  return {
    async search() {
      return {
        provider: "greenhouse" as const,
        boardToken: "acme",
        totalFound: 1,
        pagesFetched: 1,
        jobs: [
          {
            id: 123,
            title: "Software Engineer",
            absoluteUrl: "https://jobs.example.com/software-engineer",
            location: { name: "Remote" },
            departments: [{ name: "Engineering" }],
            offices: [],
            content: "Build search systems.",
            updatedAt: "2025-12-20T00:00:00.000Z",
            providerMetadata: {
              provider: "greenhouse" as const,
              boardToken: "acme",
            },
            raw: {},
          },
        ],
      };
    },
  };
}

function createLeverConnector(): Pick<LeverSearchConnector, "search"> {
  return {
    async search() {
      return {
        provider: "lever" as const,
        site: "acme",
        totalFound: 1,
        pagesFetched: 1,
        jobs: [
          {
            id: "posting-1",
            title: "Software Engineer",
            hostedUrl: "https://jobs.example.com/software-engineer",
            categories: {
              location: "Remote",
              team: "Engineering",
              department: "Engineering",
              commitment: "Full Time",
              allLocations: ["Remote"],
            },
            workplaceType: "remote",
            descriptionPlain: "Build search systems.",
            lists: [],
            providerMetadata: {
              provider: "lever" as const,
              site: "acme",
            },
            raw: {},
          },
        ],
      };
    },
  };
}

function createAshbyConnector(): Pick<AshbySearchConnector, "search"> {
  return {
    async search() {
      return {
        provider: "ashby" as const,
        jobBoardName: "acme",
        totalFound: 1,
        pagesFetched: 1,
        includeCompensation: true,
        jobs: [
          {
            title: "Software Engineer",
            location: "Remote",
            secondaryLocations: [],
            department: "Engineering",
            isListed: true,
            isRemote: true,
            workplaceType: "remote",
            descriptionPlain: "Build search systems.",
            publishedAt: "2025-12-20T00:00:00.000Z",
            jobUrl: "https://jobs.example.com/software-engineer",
            providerMetadata: {
              provider: "ashby" as const,
              jobBoardName: "acme",
            },
            raw: {},
          },
        ],
      };
    },
  };
}

function createFailingLeverConnector(): Pick<LeverSearchConnector, "search"> {
  return {
    async search() {
      throw new Error("Provider unavailable.");
    },
  };
}

function createInvalidAshbyConnector(): Pick<AshbySearchConnector, "search"> {
  return {
    async search() {
      return {
        provider: "ashby" as const,
        jobBoardName: "invalid",
        totalFound: 1,
        pagesFetched: 1,
        includeCompensation: true,
        jobs: [
          {
            secondaryLocations: [],
            providerMetadata: {
              provider: "ashby" as const,
              jobBoardName: "invalid",
            },
            raw: {},
          },
        ],
      };
    },
  };
}
