import { ProviderType, type Job } from "@job-agent/contracts";
import type { ProviderPlugin } from "@job-agent/domain";

import type { LeverConnectorConfigurationInput } from "./configuration";
import { createLeverConnectorConfiguration } from "./configuration";
import { LeverSearchConnector } from "./connector";
import { createLeverSearchRequest } from "./filters";
import type { LeverSearchResult } from "./models";

export interface LeverProviderPluginDependencies {
  connector?: LeverSearchConnector;
}

export interface LeverProviderPlugin extends ProviderPlugin {
  searchRaw(request?: Parameters<LeverSearchConnector["search"]>[0]): Promise<LeverSearchResult>;
}

export function createLeverProviderPlugin(
  input: LeverConnectorConfigurationInput,
  dependencies: LeverProviderPluginDependencies = {},
): LeverProviderPlugin {
  const configuration = createLeverConnectorConfiguration(input);
  const providerId = createLeverProviderId(configuration.site);
  const connector = dependencies.connector ?? new LeverSearchConnector(configuration);

  return {
    metadata: {
      id: providerId,
      type: ProviderType.Lever,
      name: `Lever (${configuration.site})`,
      version: "0.1.0",
      capabilities: {
        keywordSearch: true,
        pagination: true,
        locationFilters: true,
        remoteSearch: true,
        salary: true,
        future: {
          teamFilters: true,
          departmentFilters: true,
          commitmentFilters: true,
        },
      },
    },
    provider: {
      id: providerId,
      type: ProviderType.Lever,
      name: `Lever (${configuration.site})`,
      enabled: configuration.enabled,
      async search(request) {
        const result = await connector.search(createLeverSearchRequest(request.input));

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

export function createLeverProviderId(site: string): string {
  return `lever:${site}`;
}
