import type { ProviderPluginDiscoverer, ProviderPluginRegistration } from "@job-agent/domain";

import type { AshbyConnectorConfigurationInput } from "./configuration";
import { createAshbyConnectorConfiguration } from "./configuration";
import { createAshbyProviderPlugin } from "./plugin";

export function createAshbyPluginRegistration(
  input: AshbyConnectorConfigurationInput,
): ProviderPluginRegistration {
  const configuration = createAshbyConnectorConfiguration(input);

  return {
    plugin: createAshbyProviderPlugin(configuration),
    configuration: {
      enabled: configuration.enabled,
      priority: configuration.priority,
      timeoutMs: configuration.timeoutMs,
      retryPolicy: configuration.retryPolicy,
      featureFlags: {
        includeCompensation: configuration.includeCompensation,
        teamFilters: true,
        departmentFilters: true,
        employmentTypeFilters: true,
      },
    },
  };
}

export function createAshbyPluginDiscoverer(
  inputs: readonly AshbyConnectorConfigurationInput[],
): ProviderPluginDiscoverer {
  return {
    discover() {
      return inputs.map(createAshbyPluginRegistration);
    },
  };
}
