import { SearchConfigurationException } from "./errors";

export interface ProviderRetryPolicyConfiguration {
  maxAttempts: number;
  backoffMs: number;
}

export interface ProviderPluginConfiguration {
  enabled: boolean;
  priority: number;
  timeoutMs: number;
  retryPolicy?: ProviderRetryPolicyConfiguration;
  featureFlags: Readonly<Record<string, boolean>>;
}

export interface SearchConfiguration {
  enabledProviderIds: readonly string[];
  disabledProviderIds: readonly string[];
  providerPriorities: Readonly<Record<string, number>>;
  providerConfigurations: Readonly<Record<string, ProviderPluginConfiguration>>;
  timeoutMs: number;
  maxProviders: number;
}

export type SearchConfigurationInput = Partial<SearchConfiguration>;

export const DEFAULT_SEARCH_CONFIGURATION: SearchConfiguration = {
  enabledProviderIds: [],
  disabledProviderIds: [],
  providerPriorities: {},
  providerConfigurations: {},
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
    providerConfigurations: copyProviderConfigurations(input.providerConfigurations ?? {}),
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

  for (const [providerId, providerConfiguration] of Object.entries(
    configuration.providerConfigurations,
  )) {
    validateProviderPluginConfiguration(providerId, providerConfiguration);
  }

  return configuration;
}

export function createProviderPluginConfiguration(
  input: Partial<ProviderPluginConfiguration> = {},
): ProviderPluginConfiguration {
  const configuration: ProviderPluginConfiguration = {
    enabled: input.enabled ?? true,
    priority: input.priority ?? 1_000,
    timeoutMs: input.timeoutMs ?? DEFAULT_SEARCH_CONFIGURATION.timeoutMs,
    retryPolicy:
      input.retryPolicy !== undefined
        ? {
            maxAttempts: input.retryPolicy.maxAttempts,
            backoffMs: input.retryPolicy.backoffMs,
          }
        : undefined,
    featureFlags: { ...(input.featureFlags ?? {}) },
  };

  validateProviderPluginConfiguration("provider", configuration);

  return configuration;
}

function copyProviderConfigurations(
  configurations: Readonly<Record<string, ProviderPluginConfiguration>>,
): Record<string, ProviderPluginConfiguration> {
  return Object.fromEntries(
    Object.entries(configurations).map(([providerId, configuration]) => [
      providerId,
      createProviderPluginConfiguration(configuration),
    ]),
  );
}

function validateProviderPluginConfiguration(
  providerId: string,
  configuration: ProviderPluginConfiguration,
): void {
  if (!Number.isInteger(configuration.priority) || configuration.priority < 0) {
    throw new SearchConfigurationException(
      `Provider '${providerId}' priority must be a non-negative integer.`,
      "provider.priority",
    );
  }

  if (!Number.isInteger(configuration.timeoutMs) || configuration.timeoutMs <= 0) {
    throw new SearchConfigurationException(
      `Provider '${providerId}' timeout must be a positive integer.`,
      "provider.timeoutMs",
    );
  }

  if (configuration.retryPolicy !== undefined) {
    if (
      !Number.isInteger(configuration.retryPolicy.maxAttempts) ||
      configuration.retryPolicy.maxAttempts <= 0
    ) {
      throw new SearchConfigurationException(
        `Provider '${providerId}' retry attempts must be a positive integer.`,
        "provider.retryPolicy.maxAttempts",
      );
    }

    if (
      !Number.isInteger(configuration.retryPolicy.backoffMs) ||
      configuration.retryPolicy.backoffMs < 0
    ) {
      throw new SearchConfigurationException(
        `Provider '${providerId}' retry backoff must be a non-negative integer.`,
        "provider.retryPolicy.backoffMs",
      );
    }
  }

  validateBooleanMap(providerId, configuration.featureFlags, "provider.featureFlags");
}

function validateBooleanMap(
  providerId: string,
  value: Readonly<Record<string, boolean>>,
  key: string,
): void {
  if (value === null || Array.isArray(value) || typeof value !== "object") {
    throw new SearchConfigurationException(
      `Provider '${providerId}' ${key} must be an object.`,
      key,
    );
  }

  for (const [flag, enabled] of Object.entries(value)) {
    if (typeof enabled !== "boolean") {
      throw new SearchConfigurationException(
        `Provider '${providerId}' feature flag '${flag}' must be boolean.`,
        key,
      );
    }
  }
}
