import { ProviderType, type Job } from "@job-agent/contracts";
import type { ProviderPlugin } from "@job-agent/domain";

import type { AshbyConnectorConfigurationInput } from "./configuration";
import { createAshbyConnectorConfiguration } from "./configuration";
import { AshbySearchConnector } from "./connector";
import { createAshbySearchRequest } from "./filters";
import type { AshbySearchResult } from "./models";

export interface AshbyProviderPluginDependencies {
  connector?: AshbySearchConnector;
}

export interface AshbyProviderPlugin extends ProviderPlugin {
  searchRaw(request?: Parameters<AshbySearchConnector["search"]>[0]): Promise<AshbySearchResult>;
}

export function createAshbyProviderPlugin(
  input: AshbyConnectorConfigurationInput,
  dependencies: AshbyProviderPluginDependencies = {},
): AshbyProviderPlugin {
  const configuration = createAshbyConnectorConfiguration(input);
  const providerId = createAshbyProviderId(configuration.jobBoardName);
  const connector = dependencies.connector ?? new AshbySearchConnector(configuration);

  return {
    metadata: {
      id: providerId,
      type: ProviderType.Ashby,
      name: `Ashby (${configuration.jobBoardName})`,
      version: "0.1.0",
      capabilities: {
        keywordSearch: true,
        pagination: false,
        locationFilters: true,
        remoteSearch: true,
        salary: true,
        future: {
          teamFilters: true,
          departmentFilters: true,
          employmentTypeFilters: true,
        },
      },
    },
    provider: {
      id: providerId,
      type: ProviderType.Ashby,
      name: `Ashby (${configuration.jobBoardName})`,
      enabled: configuration.enabled,
      async search(request) {
        const result = await connector.search(createAshbySearchRequest(request.input));

        // Phase 3.5 intentionally returns raw provider jobs. Phase 3.6 will replace this bridge
        // with canonical Job mapping.
        return { jobs: result.jobs as unknown as Job[] };
      },
    },
    async searchRaw(request) {
      return connector.search(request);
    },
  };
}

export function createAshbyProviderId(jobBoardName: string): string {
  return `ashby:${jobBoardName}`;
}
