import type { AshbyConnectorConfiguration } from "./configuration";
import { createAshbyConnectorConfiguration } from "./configuration";
import { filterAshbyJobs } from "./filters";
import { AshbyHttpClient } from "./http-client";
import type { AshbyHttpClientDependencies } from "./http-client";
import type { AshbyLogger } from "./logger";
import { createConsoleAshbyLogger } from "./logger";
import type { AshbySearchRequest, AshbySearchResult } from "./models";
import { parseAshbyPostingsResponse } from "./parser";
import { buildAshbyJobsUrl } from "./request-builder";

export interface AshbySearchConnectorDependencies extends AshbyHttpClientDependencies {
  httpClient?: AshbyHttpClient;
  logger?: AshbyLogger;
}

export class AshbySearchConnector {
  private readonly configuration: AshbyConnectorConfiguration;
  private readonly httpClient: AshbyHttpClient;
  private readonly logger: AshbyLogger;

  constructor(
    configurationInput: Parameters<typeof createAshbyConnectorConfiguration>[0],
    dependencies: AshbySearchConnectorDependencies = {},
  ) {
    this.configuration = createAshbyConnectorConfiguration(configurationInput);
    this.logger = dependencies.logger ?? createConsoleAshbyLogger(this.configuration.loggingLevel);
    this.httpClient =
      dependencies.httpClient ??
      new AshbyHttpClient(this.configuration, {
        fetch: dependencies.fetch,
        logger: this.logger,
        sleep: dependencies.sleep,
      });
  }

  async search(request: AshbySearchRequest = {}): Promise<AshbySearchResult> {
    const url = buildAshbyJobsUrl(this.configuration);
    const response = await this.httpClient.getJson(url);
    const jobs = parseAshbyPostingsResponse(response.payload, this.configuration.jobBoardName);
    const filteredJobs = filterAshbyJobs(jobs, request);

    this.logger.info("Ashby search completed.", {
      pagesFetched: 1,
      totalFound: filteredJobs.length,
    });

    return {
      provider: "ashby",
      jobBoardName: this.configuration.jobBoardName,
      jobs: filteredJobs,
      totalFound: filteredJobs.length,
      pagesFetched: 1,
      includeCompensation: this.configuration.includeCompensation,
    };
  }
}
