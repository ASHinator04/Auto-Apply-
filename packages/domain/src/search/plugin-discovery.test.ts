import { ProviderType } from "@job-agent/contracts";

import { createStaticProviderPluginDiscoverer, discoverProviderPlugins } from "./plugin-discovery";
import type { ProviderPlugin } from "./plugin";

function createPlugin(id: string): ProviderPlugin {
  return {
    metadata: {
      id,
      type: ProviderType.Other,
      name: id,
      version: "0.0.0",
      capabilities: {
        keywordSearch: true,
        pagination: false,
        locationFilters: true,
        remoteSearch: true,
        salary: false,
        future: {},
      },
    },
    provider: {
      id,
      type: ProviderType.Other,
      name: id,
      async search() {
        return { jobs: [] };
      },
    },
  };
}

describe("provider plugin discovery", () => {
  it("discovers plugins from multiple discovery sources", async () => {
    const registrations = await discoverProviderPlugins([
      createStaticProviderPluginDiscoverer([createPlugin("provider-a")]),
      createStaticProviderPluginDiscoverer([createPlugin("provider-b")]),
    ]);

    expect(registrations.map((registration) => registration.plugin.metadata.id)).toEqual([
      "provider-a",
      "provider-b",
    ]);
  });
});
