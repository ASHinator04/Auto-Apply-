import type { JobSearchInput } from "@job-agent/contracts";

import type { SearchConfiguration } from "./configuration";
import { createSearchConfiguration } from "./configuration";
import { SearchConfigurationException } from "./errors";
import type { SearchProvider } from "./types";

const DEFAULT_PROVIDER_PRIORITY = 1_000;

export class SearchProviderRegistry {
  private readonly providers = new Map<string, SearchProvider>();

  constructor(providers: Iterable<SearchProvider> = []) {
    for (const provider of providers) {
      this.register(provider);
    }
  }

  register(provider: SearchProvider): void {
    if (!provider.id.trim()) {
      throw new SearchConfigurationException("Provider id is required.", "provider.id");
    }

    if (this.providers.has(provider.id)) {
      throw new SearchConfigurationException(
        `Search provider '${provider.id}' is already registered.`,
        "provider.id",
      );
    }

    this.providers.set(provider.id, provider);
  }

  get(providerId: string): SearchProvider | null {
    return this.providers.get(providerId) ?? null;
  }

  list(): SearchProvider[] {
    return [...this.providers.values()];
  }

  select(
    request: JobSearchInput,
    configuration: SearchConfiguration = createSearchConfiguration(),
  ): SearchProvider[] {
    const enabledProviderIds = new Set(configuration.enabledProviderIds);
    const disabledProviderIds = new Set(configuration.disabledProviderIds);
    const requestedTypes = new Set(request.providerTypes ?? []);

    return this.list()
      .filter((provider) => provider.enabled !== false)
      .filter((provider) => enabledProviderIds.size === 0 || enabledProviderIds.has(provider.id))
      .filter((provider) => !disabledProviderIds.has(provider.id))
      .filter((provider) => requestedTypes.size === 0 || requestedTypes.has(provider.type))
      .sort((left, right) => {
        const leftPriority = configuration.providerPriorities[left.id] ?? DEFAULT_PROVIDER_PRIORITY;
        const rightPriority =
          configuration.providerPriorities[right.id] ?? DEFAULT_PROVIDER_PRIORITY;

        if (leftPriority !== rightPriority) {
          return leftPriority - rightPriority;
        }

        return left.id.localeCompare(right.id);
      })
      .slice(0, configuration.maxProviders);
  }
}
