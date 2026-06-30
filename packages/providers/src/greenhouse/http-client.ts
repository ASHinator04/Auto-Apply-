import { requestJsonWithRetry } from "../shared";
import type { GreenhouseConnectorConfiguration } from "./configuration";
import { GreenhouseConnectorError } from "./errors";
import type { GreenhouseLogger } from "./logger";
import { silentGreenhouseLogger } from "./logger";

export interface GreenhouseHttpResponse {
  payload: unknown;
  nextPageUrl?: string;
}

export type GreenhouseFetch = typeof fetch;
export type GreenhouseSleep = (durationMs: number) => Promise<void>;

export interface GreenhouseHttpClientDependencies {
  fetch?: GreenhouseFetch;
  logger?: GreenhouseLogger;
  sleep?: GreenhouseSleep;
}

export class GreenhouseHttpClient {
  private readonly fetch: GreenhouseFetch;
  private readonly logger: GreenhouseLogger;
  private readonly sleep: GreenhouseSleep;

  constructor(
    private readonly configuration: GreenhouseConnectorConfiguration,
    dependencies: GreenhouseHttpClientDependencies = {},
  ) {
    this.fetch = dependencies.fetch ?? globalThis.fetch.bind(globalThis);
    this.logger = dependencies.logger ?? silentGreenhouseLogger;
    this.sleep =
      dependencies.sleep ??
      ((durationMs) =>
        new Promise((resolve) => {
          setTimeout(resolve, durationMs);
        }));
  }

  async getJson(url: string): Promise<GreenhouseHttpResponse> {
    const allowedPaginationOrigin = new URL(this.configuration.baseUrl).origin;
    const response = await requestJsonWithRetry({
      providerName: "Greenhouse",
      requestDescription: "Greenhouse jobs",
      url,
      userAgent: this.configuration.userAgent,
      timeoutMs: this.configuration.timeoutMs,
      retryPolicy: this.configuration.retryPolicy,
      fetch: this.fetch,
      sleep: this.sleep,
      logger: this.logger,
      createError: (message, kind, details) => new GreenhouseConnectorError(message, kind, details),
      isProviderError: (error) => error instanceof GreenhouseConnectorError,
    });

    return {
      payload: response.payload,
      nextPageUrl: parseNextPageUrl(response.response.headers.get("link"), allowedPaginationOrigin),
    };
  }
}

function parseNextPageUrl(linkHeader: string | null, allowedOrigin: string): string | undefined {
  if (linkHeader === null) {
    return undefined;
  }

  const nextLink = linkHeader
    .split(",")
    .map((link) => link.trim())
    .find((link) => link.includes('rel="next"'));

  const match = nextLink?.match(/<([^>]+)>/);

  if (match?.[1] === undefined) {
    return undefined;
  }

  try {
    const nextUrl = new URL(match[1]);

    if (nextUrl.origin !== allowedOrigin) {
      return undefined;
    }

    return nextUrl.toString();
  } catch {
    return undefined;
  }
}
