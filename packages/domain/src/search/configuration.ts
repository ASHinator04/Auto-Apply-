import { SearchConfigurationException } from "./errors";

export interface SearchConfiguration {
  enabledProviderIds: readonly string[];
  disabledProviderIds: readonly string[];
  providerPriorities: Readonly<Record<string, number>>;
  timeoutMs: number;
  maxProviders: number;
}

export type SearchConfigurationInput = Partial<SearchConfiguration>;

export const DEFAULT_SEARCH_CONFIGURATION: SearchConfiguration = {
  enabledProviderIds: [],
  disabledProviderIds: [],
  providerPriorities: {},
  timeoutMs: 30_000,
  maxProviders: 10,
};

export function createSearchConfiguration(
  input: SearchConfigurationInput = {},
): SearchConfiguration {
  const configuration: SearchConfiguration = {
    ...DEFAULT_SEARCH_CONFIGURATION,
    ...input,
    enabledProviderIds: [...(input.enabledProviderIds ?? [])],
    disabledProviderIds: [...(input.disabledProviderIds ?? [])],
    providerPriorities: { ...(input.providerPriorities ?? {}) },
  };

  if (!Number.isInteger(configuration.timeoutMs) || configuration.timeoutMs <= 0) {
    throw new SearchConfigurationException(
      "Search timeout must be a positive integer.",
      "timeoutMs",
    );
  }

  if (!Number.isInteger(configuration.maxProviders) || configuration.maxProviders <= 0) {
    throw new SearchConfigurationException(
      "Maximum providers must be a positive integer.",
      "maxProviders",
    );
  }

  return configuration;
}
