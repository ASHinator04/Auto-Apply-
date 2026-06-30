import {
  createProviderPluginConfiguration,
  createSearchConfiguration,
  DEFAULT_SEARCH_CONFIGURATION,
} from "./configuration";
import { SearchConfigurationException } from "./errors";

describe("search configuration", () => {
  it("applies default configuration", () => {
    expect(createSearchConfiguration()).toEqual(DEFAULT_SEARCH_CONFIGURATION);
  });

  it("copies mutable inputs", () => {
    const enabledProviderIds = ["provider-a"];
    const configuration = createSearchConfiguration({ enabledProviderIds });

    enabledProviderIds.push("provider-b");

    expect(configuration.enabledProviderIds).toEqual(["provider-a"]);
  });

  it("rejects invalid timeout values", () => {
    expect(() => createSearchConfiguration({ timeoutMs: 0 })).toThrow(SearchConfigurationException);
  });

  it("rejects invalid provider limits", () => {
    expect(() => createSearchConfiguration({ maxProviders: -1 })).toThrow(
      SearchConfigurationException,
    );
  });

  it("validates provider plugin configuration", () => {
    expect(
      createProviderPluginConfiguration({
        enabled: false,
        priority: 2,
        timeoutMs: 100,
        retryPolicy: {
          maxAttempts: 3,
          backoffMs: 50,
        },
        featureFlags: {
          experimentalFilter: true,
        },
      }),
    ).toMatchObject({
      enabled: false,
      priority: 2,
      timeoutMs: 100,
      retryPolicy: {
        maxAttempts: 3,
        backoffMs: 50,
      },
      featureFlags: {
        experimentalFilter: true,
      },
    });
  });

  it("rejects invalid provider plugin retry configuration", () => {
    expect(() =>
      createProviderPluginConfiguration({
        retryPolicy: {
          maxAttempts: 0,
          backoffMs: 0,
        },
      }),
    ).toThrow(SearchConfigurationException);
  });

  it("rejects non-boolean provider plugin feature flags", () => {
    expect(() =>
      createProviderPluginConfiguration({
        featureFlags: {
          experimentalFilter: "yes",
        } as unknown as Record<string, boolean>,
      }),
    ).toThrow(SearchConfigurationException);
  });
});
