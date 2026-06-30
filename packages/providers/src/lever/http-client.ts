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

const TRANSIENT_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

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
    for (let attempt = 1; attempt <= this.configuration.retryPolicy.maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.configuration.timeoutMs);

      try {
        this.logger.debug("Requesting Lever postings.", { url, attempt });
        const response = await this.fetch(url, {
          headers: {
            "User-Agent": this.configuration.userAgent,
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (response.ok) {
          return {
            payload: await parseJsonResponse(response),
          };
        }

        if (shouldRetry(response.status, attempt, this.configuration.retryPolicy.maxAttempts)) {
          this.logger.info("Retrying transient Lever response.", {
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
            this.logger.info("Retrying timed out Lever request.", { attempt });
            await this.sleep(this.configuration.retryPolicy.backoffMs);
            continue;
          }

          throw new LeverConnectorError("Lever request timed out.", "timeout");
        }

        if (error instanceof LeverConnectorError) {
          throw error;
        }

        if (attempt < this.configuration.retryPolicy.maxAttempts) {
          this.logger.info("Retrying failed Lever request.", { attempt });
          await this.sleep(this.configuration.retryPolicy.backoffMs);
          continue;
        }

        throw new LeverConnectorError("Lever network request failed.", "network");
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new LeverConnectorError("Lever request failed after retries.", "network");
  }
}

function shouldRetry(status: number, attempt: number, maxAttempts: number): boolean {
  return TRANSIENT_STATUSES.has(status) && attempt < maxAttempts;
}

function createStatusError(status: number): LeverConnectorError {
  if (status === 429) {
    return new LeverConnectorError("Lever rate limit exceeded.", "rate_limited", { status });
  }

  if (TRANSIENT_STATUSES.has(status)) {
    return new LeverConnectorError("Lever temporary failure.", "temporary_failure", { status });
  }

  return new LeverConnectorError("Lever request was rejected.", "network", { status });
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

async function parseJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new LeverConnectorError("Lever response was not valid JSON.", "invalid_response");
  }
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException ||
      (typeof error === "object" && error !== null && "name" in error)) &&
    (error as { name?: unknown }).name === "AbortError"
  );
}
