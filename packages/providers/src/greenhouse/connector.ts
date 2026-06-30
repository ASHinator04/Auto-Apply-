import type { GreenhouseConnectorConfiguration } from "./configuration";
import { createGreenhouseConnectorConfiguration } from "./configuration";
import { filterGreenhouseJobs } from "./filters";
import { GreenhouseHttpClient } from "./http-client";
import type { GreenhouseHttpClientDependencies } from "./http-client";
import type { GreenhouseLogger } from "./logger";
import { createConsoleGreenhouseLogger } from "./logger";
import type { GreenhouseSearchRequest, GreenhouseSearchResult, RawGreenhouseJob } from "./models";
import { parseGreenhouseJobsResponse } from "./parser";
import { buildGreenhouseJobsUrl } from "./request-builder";

export interface GreenhouseSearchConnectorDependencies extends GreenhouseHttpClientDependencies {
  httpClient?: GreenhouseHttpClient;
  logger?: GreenhouseLogger;
}

export class GreenhouseSearchConnector {
  private readonly configuration: GreenhouseConnectorConfiguration;
  private readonly httpClient: GreenhouseHttpClient;
  private readonly logger: GreenhouseLogger;

  constructor(
    configurationInput: Parameters<typeof createGreenhouseConnectorConfiguration>[0],
    dependencies: GreenhouseSearchConnectorDependencies = {},
  ) {
    this.configuration = createGreenhouseConnectorConfiguration(configurationInput);
    this.logger =
      dependencies.logger ?? createConsoleGreenhouseLogger(this.configuration.loggingLevel);
    this.httpClient =
      dependencies.httpClient ??
      new GreenhouseHttpClient(this.configuration, {
        fetch: dependencies.fetch,
        logger: this.logger,
        sleep: dependencies.sleep,
      });
  }

  async search(request: GreenhouseSearchRequest = {}): Promise<GreenhouseSearchResult> {
    const jobs: RawGreenhouseJob[] = [];
    let pagesFetched = 0;
    let nextPageUrl: string | undefined = buildGreenhouseJobsUrl(this.configuration);

    while (nextPageUrl !== undefined && pagesFetched < this.configuration.maxPages) {
      const response = await this.httpClient.getJson(nextPageUrl);
      jobs.push(...parseGreenhouseJobsResponse(response.payload, this.configuration.boardToken));
      pagesFetched += 1;
      nextPageUrl = response.nextPageUrl;
    }

    const filteredJobs = filterGreenhouseJobs(jobs, request);
    this.logger.info("Greenhouse search completed.", {
      pagesFetched,
      totalFound: filteredJobs.length,
    });

    return {
      provider: "greenhouse",
      boardToken: this.configuration.boardToken,
      jobs: filteredJobs,
      totalFound: filteredJobs.length,
      pagesFetched,
    };
  }
}
