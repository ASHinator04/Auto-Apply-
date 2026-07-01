import { requestJsonWithRetry } from "../shared";
import type { AshbyConnectorConfiguration } from "./configuration";
import { AshbyConnectorError } from "./errors";
import type { AshbyLogger } from "./logger";
import { silentAshbyLogger } from "./logger";

export interface AshbyHttpResponse {
  payload: unknown;
}

export type AshbyFetch = typeof fetch;
export type AshbySleep = (durationMs: number) => Promise<void>;

export interface AshbyHttpClientDependencies {
  fetch?: AshbyFetch;
  logger?: AshbyLogger;
  sleep?: AshbySleep;
}

export class AshbyHttpClient {
  private readonly fetch: AshbyFetch;
  private readonly logger: AshbyLogger;
  private readonly sleep: AshbySleep;

  constructor(
    private readonly configuration: AshbyConnectorConfiguration,
    dependencies: AshbyHttpClientDependencies = {},
  ) {
    this.fetch = dependencies.fetch ?? globalThis.fetch.bind(globalThis);
    this.logger = dependencies.logger ?? silentAshbyLogger;
    this.sleep =
      dependencies.sleep ??
      ((durationMs) =>
        new Promise((resolve) => {
          setTimeout(resolve, durationMs);
        }));
  }

  async getJson(url: string): Promise<AshbyHttpResponse> {
    const response = await requestJsonWithRetry({
      providerName: "Ashby",
      requestDescription: "Ashby job postings",
      url,
      userAgent: this.configuration.userAgent,
      timeoutMs: this.configuration.timeoutMs,
      retryPolicy: this.configuration.retryPolicy,
      fetch: this.fetch,
      sleep: this.sleep,
      logger: this.logger,
      createError: (message, kind, details) => new AshbyConnectorError(message, kind, details),
      isProviderError: (error) => error instanceof AshbyConnectorError,
    });

    return {
      payload: response.payload,
    };
  }
}
