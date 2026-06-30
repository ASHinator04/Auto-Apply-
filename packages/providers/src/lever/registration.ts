import type { ProviderPluginDiscoverer, ProviderPluginRegistration } from "@job-agent/domain";

import type { LeverConnectorConfigurationInput } from "./configuration";
import { createLeverConnectorConfiguration } from "./configuration";
import { createLeverProviderPlugin } from "./plugin";

export function createLeverPluginRegistration(
  input: LeverConnectorConfigurationInput,
): ProviderPluginRegistration {
  const configuration = createLeverConnectorConfiguration(input);

  return {
    plugin: createLeverProviderPlugin(configuration),
    configuration: {
      enabled: configuration.enabled,
      priority: configuration.priority,
      timeoutMs: configuration.timeoutMs,
      retryPolicy: configuration.retryPolicy,
      featureFlags: {
        teamFilters: true,
        departmentFilters: true,
        commitmentFilters: true,
      },
    },
  };
}

export function createLeverPluginDiscoverer(
  inputs: readonly LeverConnectorConfigurationInput[],
): ProviderPluginDiscoverer {
  return {
    discover() {
      return inputs.map(createLeverPluginRegistration);
    },
  };
}
