import { createSearchConfiguration, DEFAULT_SEARCH_CONFIGURATION } from "./configuration";
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
});
