import { ProviderType } from "@job-agent/contracts";
import type { JobSearchInput } from "@job-agent/contracts";

import { createSearchConfiguration } from "./configuration";
import { SearchConfigurationException } from "./errors";
import { SearchProviderRegistry } from "./registry";
import type { SearchProvider } from "./types";

const request: JobSearchInput = {
  userId: "user-1",
  query: "software engineer",
};

function createProvider(id: string, enabled = true): SearchProvider {
  return {
    id,
    type: ProviderType.Other,
    name: id,
    enabled,
    async search() {
      return { jobs: [] };
    },
  };
}

describe("search provider registry", () => {
  it("starts empty", () => {
    expect(new SearchProviderRegistry().list()).toEqual([]);
  });

  it("registers and retrieves providers", () => {
    const provider = createProvider("provider-a");
    const registry = new SearchProviderRegistry([provider]);

    expect(registry.get("provider-a")).toBe(provider);
    expect(registry.list()).toEqual([provider]);
  });

  it("rejects duplicate provider ids", () => {
    const provider = createProvider("provider-a");
    const registry = new SearchProviderRegistry([provider]);

    expect(() => registry.register(provider)).toThrow(SearchConfigurationException);
  });

  it("selects providers by enabled, disabled, priority, and maximum provider rules", () => {
    const registry = new SearchProviderRegistry([
      createProvider("provider-c"),
      createProvider("provider-a"),
      createProvider("provider-b"),
      createProvider("provider-d", false),
    ]);
    const configuration = createSearchConfiguration({
      enabledProviderIds: ["provider-a", "provider-b", "provider-c", "provider-d"],
      disabledProviderIds: ["provider-b"],
      providerPriorities: {
        "provider-a": 2,
        "provider-c": 1,
      },
      maxProviders: 1,
    });

    expect(registry.select(request, configuration).map((provider) => provider.id)).toEqual([
      "provider-c",
    ]);
  });
});
