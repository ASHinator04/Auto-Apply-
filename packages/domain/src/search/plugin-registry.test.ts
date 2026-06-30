import { ProviderType } from "@job-agent/contracts";

import { SearchConfigurationException } from "./errors";
import type { ProviderPlugin, ProviderPluginCapabilitySet } from "./plugin";
import { ProviderPluginLifecycleStatus } from "./plugin";
import { ProviderPluginRegistry } from "./plugin-registry";

const capabilities: ProviderPluginCapabilitySet = {
  keywordSearch: true,
  pagination: false,
  locationFilters: true,
  remoteSearch: true,
  salary: false,
  future: {},
};

function createPlugin(
  id: string,
  options: {
    capabilities?: ProviderPluginCapabilitySet;
    name?: string;
    providerId?: string;
    initialize?: ProviderPlugin["initialize"];
    shutdown?: ProviderPlugin["shutdown"];
  } = {},
): ProviderPlugin {
  return {
    metadata: {
      id,
      type: ProviderType.Other,
      name: options.name ?? id,
      version: "0.0.0",
      capabilities: options.capabilities ?? capabilities,
    },
    provider: {
      id: options.providerId ?? id,
      type: ProviderType.Other,
      name: id,
      async search() {
        return { jobs: [] };
      },
    },
    initialize: options.initialize,
    shutdown: options.shutdown,
  };
}

describe("provider plugin registry", () => {
  it("registers valid provider plugins and exposes metadata without initialization", () => {
    const registry = new ProviderPluginRegistry([
      {
        plugin: createPlugin("provider-a"),
        configuration: {
          priority: 2,
          enabled: true,
        },
      },
    ]);

    expect(registry.listMetadata()).toEqual([
      expect.objectContaining({
        id: "provider-a",
        name: "provider-a",
      }),
    ]);
    expect(registry.list()[0]).toMatchObject({
      configuration: {
        enabled: true,
        priority: 2,
      },
      status: ProviderPluginLifecycleStatus.Validated,
    });
  });

  it("rejects duplicate provider plugin ids", () => {
    const plugin = createPlugin("provider-a");

    expect(() => new ProviderPluginRegistry([{ plugin }, { plugin }])).toThrow(
      SearchConfigurationException,
    );
  });

  it("rejects invalid metadata and mismatched provider wiring", () => {
    expect(
      () => new ProviderPluginRegistry([{ plugin: createPlugin("provider-a", { name: "" }) }]),
    ).toThrow(SearchConfigurationException);
    expect(
      () =>
        new ProviderPluginRegistry([
          { plugin: createPlugin("provider-a", { providerId: "provider-b" }) },
        ]),
    ).toThrow(SearchConfigurationException);
  });

  it("rejects missing capability declarations", () => {
    const invalidCapabilities = {
      keywordSearch: true,
      pagination: false,
      locationFilters: true,
      remoteSearch: true,
      salary: undefined,
      future: {},
    } as unknown as ProviderPluginCapabilitySet;

    expect(
      () =>
        new ProviderPluginRegistry([
          { plugin: createPlugin("provider-a", { capabilities: invalidCapabilities }) },
        ]),
    ).toThrow(SearchConfigurationException);
  });

  it("rejects invalid future capability declarations", () => {
    const invalidCapabilities = {
      ...capabilities,
      future: {
        customFilter: "yes",
      },
    } as unknown as ProviderPluginCapabilitySet;

    expect(
      () =>
        new ProviderPluginRegistry([
          { plugin: createPlugin("provider-a", { capabilities: invalidCapabilities }) },
        ]),
    ).toThrow(SearchConfigurationException);
  });

  it("returns descriptor snapshots that do not mutate registry state", () => {
    const registry = new ProviderPluginRegistry([{ plugin: createPlugin("provider-a") }]);
    const descriptor = registry.list()[0];

    if (descriptor === undefined) {
      throw new Error("Expected provider descriptor.");
    }

    (descriptor.metadata.capabilities.future as Record<string, boolean>).changed = true;
    (descriptor.configuration.featureFlags as Record<string, boolean>).changed = true;

    expect(registry.list()[0]?.metadata.capabilities.future).toEqual({});
    expect(registry.list()[0]?.configuration.featureFlags).toEqual({});
  });

  it("enables, disables, resolves, and validates provider plugins", () => {
    const plugin = createPlugin("provider-a");
    const registry = new ProviderPluginRegistry([
      {
        plugin,
        configuration: {
          enabled: false,
        },
      },
    ]);

    expect(registry.resolve("provider-a")).toBe(plugin);
    expect(registry.list()[0]?.status).toBe(ProviderPluginLifecycleStatus.Disabled);

    registry.enable("provider-a");
    registry.validate("provider-a");
    expect(registry.list()[0]?.status).toBe(ProviderPluginLifecycleStatus.Validated);

    registry.disable("provider-a");
    expect(registry.list()[0]?.status).toBe(ProviderPluginLifecycleStatus.Disabled);
  });

  it("initializes enabled plugins and exposes only ready providers to the search registry", async () => {
    const initialized: string[] = [];
    const registry = new ProviderPluginRegistry([
      {
        plugin: createPlugin("provider-a", {
          initialize({ configuration }) {
            if (configuration.enabled) {
              initialized.push("provider-a");
            }
          },
        }),
      },
      {
        plugin: createPlugin("provider-b"),
        configuration: {
          enabled: false,
        },
      },
    ]);

    await registry.initializeAll();

    expect(initialized).toEqual(["provider-a"]);
    expect(registry.readyProviders().map((provider) => provider.id)).toEqual(["provider-a"]);
    expect(
      registry
        .createSearchProviderRegistry()
        .list()
        .map((provider) => provider.id),
    ).toEqual(["provider-a"]);
  });

  it("does not initialize a ready plugin more than once", async () => {
    const initialized: string[] = [];
    const registry = new ProviderPluginRegistry([
      {
        plugin: createPlugin("provider-a", {
          initialize() {
            initialized.push("provider-a");
          },
        }),
      },
    ]);

    await registry.initialize("provider-a");
    await registry.initialize("provider-a");

    expect(initialized).toEqual(["provider-a"]);
  });

  it("does not initialize disabled plugins", async () => {
    const registry = new ProviderPluginRegistry([
      {
        plugin: createPlugin("provider-a"),
        configuration: {
          enabled: false,
        },
      },
    ]);

    await expect(registry.initialize("provider-a")).rejects.toThrow(SearchConfigurationException);
  });

  it("rejects invalid lifecycle transitions", async () => {
    const registry = new ProviderPluginRegistry([{ plugin: createPlugin("provider-a") }]);

    await expect(registry.shutdown("provider-a")).rejects.toThrow(SearchConfigurationException);

    await registry.initialize("provider-a");

    expect(() => registry.disable("provider-a")).toThrow(SearchConfigurationException);
  });

  it("runs shutdown lifecycle hooks after initialization", async () => {
    const shutdown: string[] = [];
    const registry = new ProviderPluginRegistry([
      {
        plugin: createPlugin("provider-a", {
          shutdown() {
            shutdown.push("provider-a");
          },
        }),
      },
    ]);

    await registry.initialize("provider-a");
    await registry.shutdown("provider-a");
    await registry.shutdown("provider-a");

    expect(shutdown).toEqual(["provider-a"]);
    expect(registry.list()[0]?.status).toBe(ProviderPluginLifecycleStatus.Shutdown);
    expect(() => registry.enable("provider-a")).toThrow(SearchConfigurationException);
  });
});
