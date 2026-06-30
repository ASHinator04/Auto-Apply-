import { ProviderType } from "@job-agent/contracts";
import { ProviderPluginRegistry } from "@job-agent/domain";

import type { LeverSearchConnector } from "./connector";
import { createLeverProviderId, createLeverProviderPlugin } from "./plugin";
import { createLeverPluginDiscoverer, createLeverPluginRegistration } from "./registration";

describe("lever provider plugin", () => {
  it("creates valid Lever plugin metadata and raw search access", async () => {
    const connector = {
      async search() {
        return {
          provider: "lever" as const,
          site: "acme",
          jobs: [],
          totalFound: 0,
          pagesFetched: 1,
        };
      },
    } satisfies Pick<LeverSearchConnector, "search">;

    const plugin = createLeverProviderPlugin(
      { site: "acme" },
      { connector: connector as unknown as LeverSearchConnector },
    );

    expect(plugin.metadata).toMatchObject({
      id: createLeverProviderId("acme"),
      type: ProviderType.Lever,
      capabilities: {
        keywordSearch: true,
        pagination: true,
        locationFilters: true,
        remoteSearch: true,
        salary: true,
      },
    });
    await expect(plugin.searchRaw()).resolves.toMatchObject({
      provider: "lever",
      site: "acme",
    });
  });

  it("registers through the provider plugin registry", async () => {
    const registration = createLeverPluginRegistration({
      site: "acme",
      enabled: true,
      priority: 5,
    });
    const registry = new ProviderPluginRegistry([registration]);

    await registry.initializeAll();

    expect(registry.list()[0]).toMatchObject({
      metadata: {
        id: createLeverProviderId("acme"),
        type: ProviderType.Lever,
      },
      configuration: {
        enabled: true,
        priority: 5,
      },
    });
    expect(registry.readyProviders().map((provider) => provider.id)).toEqual([
      createLeverProviderId("acme"),
    ]);
  });

  it("returns raw Lever jobs through the provider contract bridge", async () => {
    const connector = {
      async search() {
        return {
          provider: "lever" as const,
          site: "acme",
          jobs: [
            {
              id: "posting-1",
              title: "Software Engineer",
              categories: {
                allLocations: [],
              },
              lists: [],
              providerMetadata: {
                provider: "lever" as const,
                site: "acme",
              },
              raw: {},
            },
          ],
          totalFound: 1,
          pagesFetched: 1,
        };
      },
    } satisfies Pick<LeverSearchConnector, "search">;
    const plugin = createLeverProviderPlugin(
      { site: "acme" },
      { connector: connector as unknown as LeverSearchConnector },
    );

    const response = await plugin.provider.search({
      input: {
        userId: "user-1",
        query: "engineer",
      },
      timeoutMs: 1_000,
    });

    expect(response.jobs[0]).toMatchObject({
      id: "posting-1",
      title: "Software Engineer",
      providerMetadata: {
        provider: "lever",
        site: "acme",
      },
    });
  });

  it("discovers Lever plugin registrations", async () => {
    const registrations = await createLeverPluginDiscoverer([
      { site: "acme" },
      { site: "beta" },
    ]).discover();

    expect(registrations.map((registration) => registration.plugin.metadata.id)).toEqual([
      createLeverProviderId("acme"),
      createLeverProviderId("beta"),
    ]);
  });
});
