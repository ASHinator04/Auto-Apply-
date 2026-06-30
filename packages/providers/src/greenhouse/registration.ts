import type { ProviderPluginDiscoverer, ProviderPluginRegistration } from "@job-agent/domain";

import type { GreenhouseConnectorConfigurationInput } from "./configuration";
import { createGreenhouseConnectorConfiguration } from "./configuration";
import { createGreenhouseProviderPlugin } from "./plugin";

export function createGreenhousePluginRegistration(
  input: GreenhouseConnectorConfigurationInput,
): ProviderPluginRegistration {
  const configuration = createGreenhouseConnectorConfiguration(input);

  return {
    plugin: createGreenhouseProviderPlugin(configuration),
    configuration: {
      enabled: configuration.enabled,
      priority: configuration.priority,
      timeoutMs: configuration.timeoutMs,
      retryPolicy: configuration.retryPolicy,
      featureFlags: {
        departmentFilters: true,
      },
    },
  };
}

export function createGreenhousePluginDiscoverer(
  inputs: readonly GreenhouseConnectorConfigurationInput[],
): ProviderPluginDiscoverer {
  return {
    discover() {
      return inputs.map(createGreenhousePluginRegistration);
    },
  };
}
