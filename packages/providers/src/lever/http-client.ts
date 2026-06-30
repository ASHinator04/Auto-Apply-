import { requestJsonWithRetry } from "../shared";
import type { LeverConnectorConfiguration } from "./configuration";
import { LeverConnectorError } from "./errors";
import type { LeverLogger } from "./logger";
import { silentLeverLogger } from "./logger";

export interface LeverHttpResponse {
  payload: unknown;
}

export type LeverFetch = typeof fetch;
export type LeverSleep = (durationMs: number) => Promise<void>;

export interface LeverHttpClientDependencies {
  fetch?: LeverFetch;
  logger?: LeverLogger;
  sleep?: LeverSleep;
}

export class LeverHttpClient {
  private readonly fetch: LeverFetch;
  private readonly logger: LeverLogger;
  private readonly sleep: LeverSleep;

  constructor(
    private readonly configuration: LeverConnectorConfiguration,
    dependencies: LeverHttpClientDependencies = {},
  ) {
    this.fetch = dependencies.fetch ?? globalThis.fetch.bind(globalThis);
    this.logger = dependencies.logger ?? silentLeverLogger;
    this.sleep =
      dependencies.sleep ??
      ((durationMs) =>
        new Promise((resolve) => {
          setTimeout(resolve, durationMs);
        }));
  }

  async getJson(url: string): Promise<LeverHttpResponse> {
    const response = await requestJsonWithRetry({
      providerName: "Lever",
      requestDescription: "Lever postings",
      url,
      userAgent: this.configuration.userAgent,
      timeoutMs: this.configuration.timeoutMs,
      retryPolicy: this.configuration.retryPolicy,
      fetch: this.fetch,
      sleep: this.sleep,
      logger: this.logger,
      createError: (message, kind, details) => new LeverConnectorError(message, kind, details),
      isProviderError: (error) => error instanceof LeverConnectorError,
    });

    return {
      payload: response.payload,
    };
  }
}
