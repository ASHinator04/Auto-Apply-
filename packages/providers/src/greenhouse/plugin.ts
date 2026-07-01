import { ProviderType, type Job } from "@job-agent/contracts";
import type { ProviderPlugin } from "@job-agent/domain";

import type { GreenhouseConnectorConfigurationInput } from "./configuration";
import { createGreenhouseConnectorConfiguration } from "./configuration";
import { GreenhouseSearchConnector } from "./connector";
import { createGreenhouseSearchRequest } from "./filters";
import type { GreenhouseSearchResult } from "./models";

export interface GreenhouseProviderPluginDependencies {
  connector?: GreenhouseSearchConnector;
}

export interface GreenhouseProviderPlugin extends ProviderPlugin {
  searchRaw(
    request?: Parameters<GreenhouseSearchConnector["search"]>[0],
  ): Promise<GreenhouseSearchResult>;
}

export function createGreenhouseProviderPlugin(
  input: GreenhouseConnectorConfigurationInput,
  dependencies: GreenhouseProviderPluginDependencies = {},
): GreenhouseProviderPlugin {
  const configuration = createGreenhouseConnectorConfiguration(input);
  const providerId = createGreenhouseProviderId(configuration.boardToken);
  const connector = dependencies.connector ?? new GreenhouseSearchConnector(configuration);

  return {
    metadata: {
      id: providerId,
      type: ProviderType.Greenhouse,
      name: `Greenhouse (${configuration.boardToken})`,
      version: "0.1.0",
      capabilities: {
        keywordSearch: true,
        pagination: true,
        locationFilters: true,
        remoteSearch: true,
        salary: false,
        future: {
          departmentFilters: true,
        },
      },
    },
    provider: {
      id: providerId,
      type: ProviderType.Greenhouse,
      name: `Greenhouse (${configuration.boardToken})`,
      enabled: configuration.enabled,
      async search(request) {
        const result = await connector.search(createGreenhouseSearchRequest(request.input));

        // Provider plugins expose raw jobs through the contract bridge; SearchService.searchUnified
        // sends them through the certified processing pipeline.
        return { jobs: result.jobs as unknown as Job[] };
      },
    },
    async searchRaw(request) {
      return connector.search(request);
    },
  };
}

export function createGreenhouseProviderId(boardToken: string): string {
  return `greenhouse:${boardToken}`;
}
