export interface ProviderHttpLogger {
  info(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

export type ProviderFetch = typeof fetch;
export type ProviderSleep = (durationMs: number) => Promise<void>;

export interface ProviderRetryPolicy {
  maxAttempts: number;
  backoffMs: number;
}

export type ProviderHttpErrorFactory = (
  message: string,
  kind: "network" | "timeout" | "rate_limited" | "temporary_failure" | "invalid_response",
  details?: Record<string, string | number | boolean | undefined>,
) => Error;

export interface RequestJsonWithRetryOptions {
  providerName: string;
  requestDescription: string;
  url: string;
  userAgent: string;
  timeoutMs: number;
  retryPolicy: ProviderRetryPolicy;
  fetch: ProviderFetch;
  sleep: ProviderSleep;
  logger: ProviderHttpLogger;
  createError: ProviderHttpErrorFactory;
  isProviderError(error: unknown): boolean;
}

export interface JsonHttpResponse {
  payload: unknown;
  response: Response;
}

const TRANSIENT_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

export async function requestJsonWithRetry(
  options: RequestJsonWithRetryOptions,
): Promise<JsonHttpResponse> {
  for (let attempt = 1; attempt <= options.retryPolicy.maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

    try {
      options.logger.debug(`Requesting ${options.requestDescription}.`, {
        url: options.url,
        attempt,
      });
      const response = await options.fetch(options.url, {
        headers: {
          "User-Agent": options.userAgent,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      if (response.ok) {
        return {
          payload: await parseJsonResponse(response, options),
          response,
        };
      }

      if (shouldRetry(response.status, attempt, options.retryPolicy.maxAttempts)) {
        options.logger.info(`Retrying transient ${options.providerName} response.`, {
          status: response.status,
          attempt,
        });
        await options.sleep(getRetryDelayMs(response, options.retryPolicy.backoffMs));
        continue;
      }

      throw createStatusError(response.status, options);
    } catch (error) {
      if (isAbortError(error)) {
        if (attempt < options.retryPolicy.maxAttempts) {
          options.logger.info(`Retrying timed out ${options.providerName} request.`, { attempt });
          await options.sleep(options.retryPolicy.backoffMs);
          continue;
        }

        throw options.createError(`${options.providerName} request timed out.`, "timeout");
      }

      if (options.isProviderError(error)) {
        throw error;
      }

      if (attempt < options.retryPolicy.maxAttempts) {
        options.logger.info(`Retrying failed ${options.providerName} request.`, { attempt });
        await options.sleep(options.retryPolicy.backoffMs);
        continue;
      }

      throw options.createError(`${options.providerName} network request failed.`, "network");
    } finally {
      clearTimeout(timeout);
    }
  }

  throw options.createError(`${options.providerName} request failed after retries.`, "network");
}

function shouldRetry(status: number, attempt: number, maxAttempts: number): boolean {
  return TRANSIENT_STATUSES.has(status) && attempt < maxAttempts;
}

function createStatusError(status: number, options: RequestJsonWithRetryOptions): Error {
  if (status === 429) {
    return options.createError(`${options.providerName} rate limit exceeded.`, "rate_limited", {
      status,
    });
  }

  if (TRANSIENT_STATUSES.has(status)) {
    return options.createError(`${options.providerName} temporary failure.`, "temporary_failure", {
      status,
    });
  }

  return options.createError(`${options.providerName} request was rejected.`, "network", {
    status,
  });
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

async function parseJsonResponse(
  response: Response,
  options: RequestJsonWithRetryOptions,
): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw options.createError(
      `${options.providerName} response was not valid JSON.`,
      "invalid_response",
    );
  }
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException ||
      (typeof error === "object" && error !== null && "name" in error)) &&
    (error as { name?: unknown }).name === "AbortError"
  );
}
