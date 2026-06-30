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

const TRANSIENT_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

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
    for (let attempt = 1; attempt <= this.configuration.retryPolicy.maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.configuration.timeoutMs);

      try {
        this.logger.debug("Requesting Greenhouse jobs.", { url, attempt });
        const response = await this.fetch(url, {
          headers: {
            "User-Agent": this.configuration.userAgent,
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (response.ok) {
          return {
            payload: await response.json(),
            nextPageUrl: parseNextPageUrl(response.headers.get("link")),
          };
        }

        if (shouldRetry(response.status, attempt, this.configuration.retryPolicy.maxAttempts)) {
          this.logger.info("Retrying transient Greenhouse response.", {
            status: response.status,
            attempt,
          });
          await this.sleep(getRetryDelayMs(response, this.configuration.retryPolicy.backoffMs));
          continue;
        }

        throw createStatusError(response.status);
      } catch (error) {
        if (isAbortError(error)) {
          if (attempt < this.configuration.retryPolicy.maxAttempts) {
            this.logger.info("Retrying timed out Greenhouse request.", { attempt });
            await this.sleep(this.configuration.retryPolicy.backoffMs);
            continue;
          }

          throw new GreenhouseConnectorError("Greenhouse request timed out.", "timeout");
        }

        if (error instanceof GreenhouseConnectorError) {
          throw error;
        }

        if (attempt < this.configuration.retryPolicy.maxAttempts) {
          this.logger.info("Retrying failed Greenhouse request.", { attempt });
          await this.sleep(this.configuration.retryPolicy.backoffMs);
          continue;
        }

        throw new GreenhouseConnectorError("Greenhouse network request failed.", "network");
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new GreenhouseConnectorError("Greenhouse request failed after retries.", "network");
  }
}

function shouldRetry(status: number, attempt: number, maxAttempts: number): boolean {
  return TRANSIENT_STATUSES.has(status) && attempt < maxAttempts;
}

function createStatusError(status: number): GreenhouseConnectorError {
  if (status === 429) {
    return new GreenhouseConnectorError("Greenhouse rate limit exceeded.", "rate_limited", {
      status,
    });
  }

  if (TRANSIENT_STATUSES.has(status)) {
    return new GreenhouseConnectorError("Greenhouse temporary failure.", "temporary_failure", {
      status,
    });
  }

  return new GreenhouseConnectorError("Greenhouse request was rejected.", "network", { status });
}

function getRetryDelayMs(response: Response, fallbackMs: number): number {
  const retryAfter = response.headers.get("retry-after");

  if (retryAfter === null) {
    return fallbackMs;
  }

  const retryAfterSeconds = Number.parseInt(retryAfter, 10);

  if (!Number.isNaN(retryAfterSeconds)) {
    return retryAfterSeconds * 1_000;
  }

  return fallbackMs;
}

function parseNextPageUrl(linkHeader: string | null): string | undefined {
  if (linkHeader === null) {
    return undefined;
  }

  const nextLink = linkHeader
    .split(",")
    .map((link) => link.trim())
    .find((link) => link.includes('rel="next"'));

  const match = nextLink?.match(/<([^>]+)>/);

  return match?.[1];
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
