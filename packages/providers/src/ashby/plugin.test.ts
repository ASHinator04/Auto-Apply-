import { ProviderType } from "@job-agent/contracts";
import { ProviderPluginRegistry } from "@job-agent/domain";

import type { AshbySearchConnector } from "./connector";
import { createAshbyProviderId, createAshbyProviderPlugin } from "./plugin";
import { createAshbyPluginDiscoverer, createAshbyPluginRegistration } from "./registration";

describe("ashby provider plugin", () => {
  it("creates valid Ashby plugin metadata and raw search access", async () => {
    const connector = {
      async search() {
        return {
          provider: "ashby" as const,
          jobBoardName: "acme",
          jobs: [],
          totalFound: 0,
          pagesFetched: 1,
          includeCompensation: true,
        };
      },
    } satisfies Pick<AshbySearchConnector, "search">;

    const plugin = createAshbyProviderPlugin(
      { jobBoardName: "acme" },
      { connector: connector as unknown as AshbySearchConnector },
    );

    expect(plugin.metadata).toMatchObject({
      id: createAshbyProviderId("acme"),
      type: ProviderType.Ashby,
      capabilities: {
        keywordSearch: true,
        pagination: false,
        locationFilters: true,
        remoteSearch: true,
        salary: true,
      },
    });
    await expect(plugin.searchRaw()).resolves.toMatchObject({
      provider: "ashby",
      jobBoardName: "acme",
    });
  });

  it("registers through the provider plugin registry", async () => {
    const registration = createAshbyPluginRegistration({
      jobBoardName: "acme",
      enabled: true,
      priority: 5,
    });
    const registry = new ProviderPluginRegistry([registration]);

    await registry.initializeAll();

    expect(registry.list()[0]).toMatchObject({
      metadata: {
        id: createAshbyProviderId("acme"),
        type: ProviderType.Ashby,
      },
      configuration: {
        enabled: true,
        priority: 5,
      },
    });
    expect(registry.readyProviders().map((provider) => provider.id)).toEqual([
      createAshbyProviderId("acme"),
    ]);
  });

  it("returns raw Ashby jobs through the provider contract bridge", async () => {
    const connector = {
      async search() {
        return {
          provider: "ashby" as const,
          jobBoardName: "acme",
          jobs: [
            {
              title: "Software Engineer",
              secondaryLocations: [],
              providerMetadata: {
                provider: "ashby" as const,
                jobBoardName: "acme",
              },
              raw: {},
            },
          ],
          totalFound: 1,
          pagesFetched: 1,
          includeCompensation: true,
        };
      },
    } satisfies Pick<AshbySearchConnector, "search">;
    const plugin = createAshbyProviderPlugin(
      { jobBoardName: "acme" },
      { connector: connector as unknown as AshbySearchConnector },
    );

    const response = await plugin.provider.search({
      input: {
        userId: "user-1",
        query: "engineer",
      },
      timeoutMs: 1_000,
    });

    expect(response.jobs[0]).toMatchObject({
      title: "Software Engineer",
      providerMetadata: {
        provider: "ashby",
        jobBoardName: "acme",
      },
    });
  });

  it("discovers Ashby plugin registrations", async () => {
    const registrations = await createAshbyPluginDiscoverer([
      { jobBoardName: "acme" },
      { jobBoardName: "beta" },
    ]).discover();

    expect(registrations.map((registration) => registration.plugin.metadata.id)).toEqual([
      createAshbyProviderId("acme"),
      createAshbyProviderId("beta"),
    ]);
  });
});
