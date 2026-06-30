import type { LeverConnectorConfiguration } from "./configuration";
import { createLeverConnectorConfiguration } from "./configuration";
import { filterLeverJobs } from "./filters";
import { LeverHttpClient } from "./http-client";
import type { LeverHttpClientDependencies } from "./http-client";
import type { LeverLogger } from "./logger";
import { createConsoleLeverLogger } from "./logger";
import type { LeverSearchRequest, LeverSearchResult, RawLeverJob } from "./models";
import { parseLeverPostingsResponse } from "./parser";
import { buildLeverJobsUrl } from "./request-builder";

export interface LeverSearchConnectorDependencies extends LeverHttpClientDependencies {
  httpClient?: LeverHttpClient;
  logger?: LeverLogger;
}

export class LeverSearchConnector {
  private readonly configuration: LeverConnectorConfiguration;
  private readonly httpClient: LeverHttpClient;
  private readonly logger: LeverLogger;

  constructor(
    configurationInput: Parameters<typeof createLeverConnectorConfiguration>[0],
    dependencies: LeverSearchConnectorDependencies = {},
  ) {
    this.configuration = createLeverConnectorConfiguration(configurationInput);
    this.logger = dependencies.logger ?? createConsoleLeverLogger(this.configuration.loggingLevel);
    this.httpClient =
      dependencies.httpClient ??
      new LeverHttpClient(this.configuration, {
        fetch: dependencies.fetch,
        logger: this.logger,
        sleep: dependencies.sleep,
      });
  }

  async search(request: LeverSearchRequest = {}): Promise<LeverSearchResult> {
    const jobs: RawLeverJob[] = [];
    let pagesFetched = 0;
    let skip = 0;

    while (pagesFetched < this.configuration.maxPages) {
      const url = buildLeverJobsUrl(this.configuration, { request, skip });
      const response = await this.httpClient.getJson(url);
      const pageJobs = parseLeverPostingsResponse(response.payload, this.configuration.site);

      jobs.push(...pageJobs);
      pagesFetched += 1;

      if (pageJobs.length < this.configuration.pageSize) {
        break;
      }

      skip += this.configuration.pageSize;
    }

    const filteredJobs = filterLeverJobs(jobs, request);
    this.logger.info("Lever search completed.", {
      pagesFetched,
      totalFound: filteredJobs.length,
    });

    return {
      provider: "lever",
      site: this.configuration.site,
      jobs: filteredJobs,
      totalFound: filteredJobs.length,
      pagesFetched,
    };
  }
}
