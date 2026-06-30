import { ProviderType } from "@job-agent/contracts";
import { ProviderPluginRegistry } from "@job-agent/domain";

import type { GreenhouseSearchConnector } from "./connector";
import { createGreenhouseProviderId, createGreenhouseProviderPlugin } from "./plugin";
import {
  createGreenhousePluginDiscoverer,
  createGreenhousePluginRegistration,
} from "./registration";

describe("greenhouse provider plugin", () => {
  it("creates valid Greenhouse plugin metadata and raw search access", async () => {
    const connector = {
      async search() {
        return {
          provider: "greenhouse" as const,
          boardToken: "acme",
          jobs: [],
          totalFound: 0,
          pagesFetched: 1,
        };
      },
    } satisfies Pick<GreenhouseSearchConnector, "search">;

    const plugin = createGreenhouseProviderPlugin(
      { boardToken: "acme" },
      { connector: connector as unknown as GreenhouseSearchConnector },
    );

    expect(plugin.metadata).toMatchObject({
      id: createGreenhouseProviderId("acme"),
      type: ProviderType.Greenhouse,
      capabilities: {
        keywordSearch: true,
        pagination: true,
        locationFilters: true,
        remoteSearch: true,
        salary: false,
      },
    });
    await expect(plugin.searchRaw()).resolves.toMatchObject({
      provider: "greenhouse",
      boardToken: "acme",
    });
  });

  it("registers through the provider plugin registry", async () => {
    const registration = createGreenhousePluginRegistration({
      boardToken: "acme",
      enabled: true,
      priority: 5,
    });
    const registry = new ProviderPluginRegistry([registration]);

    await registry.initializeAll();

    expect(registry.list()[0]).toMatchObject({
      metadata: {
        id: createGreenhouseProviderId("acme"),
        type: ProviderType.Greenhouse,
      },
      configuration: {
        enabled: true,
        priority: 5,
      },
    });
    expect(registry.readyProviders().map((provider) => provider.id)).toEqual([
      createGreenhouseProviderId("acme"),
    ]);
  });

  it("returns raw Greenhouse jobs through the provider contract bridge", async () => {
    const connector = {
      async search() {
        return {
          provider: "greenhouse" as const,
          boardToken: "acme",
          jobs: [
            {
              id: 123,
              title: "Software Engineer",
              departments: [],
              offices: [],
              providerMetadata: {
                provider: "greenhouse" as const,
                boardToken: "acme",
              },
              raw: {},
            },
          ],
          totalFound: 1,
          pagesFetched: 1,
        };
      },
    } satisfies Pick<GreenhouseSearchConnector, "search">;
    const plugin = createGreenhouseProviderPlugin(
      { boardToken: "acme" },
      { connector: connector as unknown as GreenhouseSearchConnector },
    );

    const response = await plugin.provider.search({
      input: {
        userId: "user-1",
        query: "engineer",
      },
      timeoutMs: 1_000,
    });

    expect(response.jobs[0]).toMatchObject({
      id: 123,
      title: "Software Engineer",
      providerMetadata: {
        provider: "greenhouse",
        boardToken: "acme",
      },
    });
  });

  it("discovers Greenhouse plugin registrations", async () => {
    const registrations = await createGreenhousePluginDiscoverer([
      { boardToken: "acme" },
      { boardToken: "beta" },
    ]).discover();

    expect(registrations.map((registration) => registration.plugin.metadata.id)).toEqual([
      createGreenhouseProviderId("acme"),
      createGreenhouseProviderId("beta"),
    ]);
  });
});
